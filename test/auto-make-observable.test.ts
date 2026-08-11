import {
    autorun,
    configure,
    getDependencyTree,
    isAction,
    observable,
    Reaction,
} from "mobx";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { autoMakeObservable } from "../src/auto-make-observable.js";
import { ComponentViewModel } from "../src/component-view-model.js";
import type { RawParams } from "../src/navigation.js";
import { PageViewModel } from "../src/page-view-model.js";
import { ViewModel } from "../src/view-model.js";

// ClientApp._configureMobx() sets this in a real app; the annotation semantics
// under test only matter under strict mode, so mirror it here.
beforeAll((): void => {
    configure({ enforceActions: "always" });
});

afterAll((): void => {
    configure({ enforceActions: "never" });
});

type Org = { readonly name: string; readonly permissions: Array<string> };

describe("autoMakeObservable", () => {
    describe("read-helper methods stay tracked", () => {
        class PermissionVm extends ViewModel {
            private _org: Org | null = null;

            public get canCreate(): boolean {
                return this.hasPermission("MANAGE");
            }

            public hasPermission(permission: string): boolean {
                return this._org?.permissions.includes(permission) ?? false;
            }

            public load(): void {
                this._org = { name: "Volt", permissions: ["MANAGE"] };
            }
        }

        it("recomputes a getter whose only state access is a method call", (): void => {
            const vm = autoMakeObservable(new PermissionVm());
            const seen: Array<boolean> = [];

            const dispose = autorun((): void => {
                seen.push(vm.canCreate);
            });
            vm.load();
            dispose();

            expect(seen).toEqual([false, true]);
        });

        it("records the state read through the method as a dependency of the getter", (): void => {
            const vm = autoMakeObservable(new PermissionVm());

            const dispose = autorun((): void => {
                void vm.canCreate;
            });
            const getterDeps =
                getDependencyTree(dispose).dependencies?.[0]?.dependencies?.map(
                    (d) => d.name,
                ) ?? [];
            dispose();

            expect(getterDeps.some((n) => n.endsWith("._org"))).toBe(true);
        });

        it("tracks a method called directly from a reaction", (): void => {
            class MembersVm extends ViewModel {
                private _members: Array<string> = [];

                public isSelf(member: string): boolean {
                    return this._members.includes(member);
                }

                public load(): void {
                    this._members = ["me"];
                }
            }

            const vm = autoMakeObservable(new MembersVm());
            const seen: Array<boolean> = [];

            const dispose = autorun((): void => {
                seen.push(vm.isSelf("me"));
            });
            vm.load();
            dispose();

            expect(seen).toEqual([false, true]);
        });

        it("tracks state reached through a chain of methods", (): void => {
            class ChainVm extends ViewModel {
                private _org: Org | null = null;

                public get canCreate(): boolean {
                    return this.outer();
                }

                public outer(): boolean {
                    return this.inner("MANAGE");
                }

                public inner(permission: string): boolean {
                    return this._org?.permissions.includes(permission) ?? false;
                }

                public load(): void {
                    this._org = { name: "Volt", permissions: ["MANAGE"] };
                }
            }

            const vm = autoMakeObservable(new ChainVm());
            const seen: Array<boolean> = [];

            const dispose = autorun((): void => {
                seen.push(vm.canCreate);
            });
            vm.load();
            dispose();

            expect(seen).toEqual([false, true]);
        });
    });

    describe("action semantics are preserved", () => {
        class CounterVm extends ViewModel {
            private _count: number = 0;
            private _other: number = 0;

            public get count(): number {
                return this._count;
            }

            public get other(): number {
                return this._other;
            }

            public bumpBoth(): void {
                this._count++;
                this._other++;
            }
        }

        it("annotates methods as actions", (): void => {
            const vm = autoMakeObservable(new CounterVm());

            expect(isAction(vm.bumpBoth)).toBe(true);
        });

        it("lets a method mutate observable state under enforceActions: always", (): void => {
            const vm = autoMakeObservable(new CounterVm());

            expect((): void => {
                vm.bumpBoth();
            }).not.toThrow();
            expect(vm.count).toBe(1);
        });

        it("batches all mutations in a method into one reaction run", (): void => {
            const vm = autoMakeObservable(new CounterVm());
            let runs = 0;

            const dispose = autorun((): void => {
                void vm.count;
                void vm.other;
                runs++;
            });
            vm.bumpBoth();
            dispose();

            expect(runs).toBe(2);
        });

        it("binds methods so they survive being detached from the instance", (): void => {
            const vm = autoMakeObservable(new CounterVm());
            const detached = vm.bumpBoth;

            expect((): void => {
                detached();
            }).not.toThrow();
            expect(vm.count).toBe(1);
        });
    });

    describe("$mobxOverrides", () => {
        it("leaves a member unannotated when the override is false", (): void => {
            class OverrideVm extends ViewModel {
                public static override readonly $mobxOverrides: Record<
                    string,
                    unknown
                > = { helper: false };

                private _org: Org | null = null;

                public get canCreate(): boolean {
                    return this.helper();
                }

                public helper(): boolean {
                    return this._org !== null;
                }

                public load(): void {
                    this._org = { name: "Volt", permissions: [] };
                }
            }

            const vm = autoMakeObservable(new OverrideVm());

            expect(isAction(vm.helper)).toBe(false);

            const seen: Array<boolean> = [];
            const dispose = autorun((): void => {
                seen.push(vm.canCreate);
            });
            vm.load();
            dispose();

            expect(seen).toEqual([false, true]);
        });

        it("applies a non-false override as the annotation", (): void => {
            class RefVm extends ViewModel {
                public static override readonly $mobxOverrides: Record<
                    string,
                    unknown
                > = { items: observable.ref };

                public items: Array<number> = [];
            }

            const vm = autoMakeObservable(new RefVm());

            // observable.ref does not convert the array itself into an observable.
            expect(Array.isArray(vm.items)).toBe(true);
            expect(vm.items).not.toHaveProperty("length", undefined);
        });
    });

    // The view model hooks build and seed the view model inside useState's
    // initializer, which runs during render — and an observer's render is a MobX
    // derivation. Framework mutators invoked there must not trip strict mode.
    describe("framework seeding inside a render derivation", () => {
        function captureMobxComplaints(callback: () => void): Array<string> {
            const messages: Array<string> = [];
            const collect = (...args: Array<unknown>): void => {
                messages.push(args.join(" "));
            };
            const warn = vi.spyOn(console, "warn").mockImplementation(collect);
            const error = vi
                .spyOn(console, "error")
                .mockImplementation(collect);
            try {
                callback();
            } finally {
                warn.mockRestore();
                error.mockRestore();
            }
            return messages;
        }

        function inRenderDerivation(callback: () => void): void {
            const reaction = new Reaction("render", (): void => {});
            try {
                reaction.track(callback);
            } finally {
                reaction.dispose();
            }
        }

        it("applies component props without a strict-mode complaint", (): void => {
            class Cvm extends ComponentViewModel<{ label: string }> {
                public get label(): string {
                    return this.retrieveProps().label;
                }
            }

            let label: string | null = null;
            const messages = captureMobxComplaints((): void => {
                inRenderDerivation((): void => {
                    const vm = autoMakeObservable(new Cvm());
                    const internals = vm as unknown as {
                        _$startObserving(): void;
                        _$applyProps(props: { label: string }): boolean;
                        _$observeRefresh(): void;
                    };
                    internals._$startObserving();
                    internals._$applyProps({ label: "hi" });
                    internals._$observeRefresh();
                    label = vm.label;
                });
            });

            expect(label).toBe("hi");
            expect(messages).toEqual([]);
        });

        it("applies page params without a strict-mode complaint", (): void => {
            class Pvm extends PageViewModel<{ q: string | null }> {
                public get q(): string | null {
                    return this.retrieveParams().q;
                }
            }

            let q: string | null = null;
            const messages = captureMobxComplaints((): void => {
                inRenderDerivation((): void => {
                    const vm = autoMakeObservable(new Pvm());
                    const internals = vm as unknown as {
                        _$startObserving(): void;
                        _$routeInfo: unknown;
                        _$applyRawParams(p: RawParams, qp: RawParams): boolean;
                        _$observeRefresh(): void;
                    };
                    internals._$startObserving();
                    internals._$routeInfo = {
                        params: [
                            {
                                isQuery: true,
                                paramKey: "q",
                                parseParam: (v: string | null) => v,
                            },
                        ],
                    };
                    internals._$applyRawParams({}, { q: "term" });
                    internals._$observeRefresh();
                    q = vm.q;
                });
            });

            expect(q).toBe("term");
            expect(messages).toEqual([]);
        });
    });

    describe("computed caching", () => {
        it("does not recompute while its dependencies are unchanged", (): void => {
            let computeCount = 0;

            class CachedVm extends ViewModel {
                private _n: number = 0;

                public get doubled(): number {
                    computeCount++;
                    return this.readN() * 2;
                }

                public readN(): number {
                    return this._n;
                }

                public bump(): void {
                    this._n++;
                }
            }

            const vm = autoMakeObservable(new CachedVm());
            const dispose = autorun((): void => {
                void vm.doubled;
            });

            const afterFirst = computeCount;
            void vm.doubled;
            void vm.doubled;

            expect(computeCount).toBe(afterFirst);

            vm.bump();
            expect(computeCount).toBe(afterFirst + 1);

            dispose();
        });
    });
});
