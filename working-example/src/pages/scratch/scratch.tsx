import { PageContext, usePageViewModel } from "@nivinjoseph/n-app";
import { FlaskConical } from "lucide-react";
import { observer } from "mobx-react-lite";
import type { JSX } from "react";
import { ScratchViewModel } from "./scratch-view-model.js";

function fmt(value: unknown): string {
    if (value === null) return "<null>";
    if (typeof value === "string") return `"${value}"`;
    return String(value);
}

export const Scratch = observer(function ScratchPage(): JSX.Element {
    const { vm, ctx } = usePageViewModel(ScratchViewModel);

    return (
        <PageContext.Provider value={ctx}>
            <section className="mx-auto max-w-2xl p-4 md:p-8">
                <header className="mb-6">
                    <h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        <FlaskConical className="h-7 w-7" aria-hidden="true" />
                        Scratch — query param probe
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Route template:{" "}
                        <code>
                            /main/scratch?
                            {"{q?:string}&{n?:number}&{flag?:boolean}"}
                        </code>
                    </p>
                </header>

                <dl className="mb-6 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 rounded-xl border border-border bg-card p-4 text-sm shadow-sm">
                    <dt className="font-medium">q (string?)</dt>
                    <dd>
                        <code>{fmt(vm.q)}</code>{" "}
                        <span className="text-muted-foreground">
                            typeof {typeof vm.q}
                        </span>
                    </dd>
                    <dt className="font-medium">n (number?)</dt>
                    <dd>
                        <code>{fmt(vm.n)}</code>{" "}
                        <span className="text-muted-foreground">
                            typeof {typeof vm.n}
                        </span>
                    </dd>
                    <dt className="font-medium">flag (boolean?)</dt>
                    <dd>
                        <code>{fmt(vm.flag)}</code>{" "}
                        <span className="text-muted-foreground">
                            typeof {typeof vm.flag}
                        </span>
                    </dd>
                </dl>

                <p className="mb-4 text-sm" data-testid="param-change-count">
                    onParamsChanged fired: <code>{vm.paramChangeCount}</code>{" "}
                    time(s)
                </p>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                        onClick={() =>
                            vm.applyDraft({
                                q: "hello",
                                n: 42,
                                flag: true,
                            })
                        }
                    >
                        set all
                    </button>
                    <button
                        type="button"
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                        onClick={() => vm.applyDraft({ n: 7 })}
                    >
                        just n=7
                    </button>
                    <button
                        type="button"
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                        onClick={() => vm.applyDraft({ flag: false })}
                    >
                        just flag=false
                    </button>
                    <button
                        type="button"
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                        onClick={() => vm.applyDraft({})}
                    >
                        clear
                    </button>
                </div>

                <p className="mt-6 text-xs text-muted-foreground">
                    Try editing the URL bar directly (e.g.{" "}
                    <code>?n=not-a-number</code>) to see the error boundary kick
                    in.
                </p>
            </section>
        </PageContext.Provider>
    );
});
