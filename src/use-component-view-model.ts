import type { ClassDefinition } from "@nivinjoseph/n-util";
import { useEffect, useRef, useState } from "react";
import { autoMakeObservable } from "./auto-make-observable.js";
import type { ComponentViewModel } from "./component-view-model.js";
import { usePageContext } from "./page-context.js";
import { Utils } from "./utils.js";

export interface UseComponentViewModelResult<
    // biome-ignore lint/suspicious/noExplicitAny: nivin move
    T extends ComponentViewModel<any>,
> {
    readonly vm: T;
}

type PropsArg<TVm> =
    TVm extends ComponentViewModel<infer P>
        ? [P] extends [never]
            ? []
            : [props: P]
        : never;

// biome-ignore lint/suspicious/noExplicitAny: framework hook needs variance-free base reference
export function useComponentViewModel<T extends ComponentViewModel<any>>(
    componentViewModelType: ClassDefinition<T>,
    ...props: PropsArg<T>
): UseComponentViewModelResult<T> {
    const pageCtx = usePageContext();
    const propsZero = props[0];

    const [result] = useState<UseComponentViewModelResult<T>>(() => {
        const vm = pageCtx.resolve<T>(
            Utils.getTypeName(componentViewModelType),
        );
        autoMakeObservable(vm);
        (vm as unknown as { _$startObserving(): void })._$startObserving();
        if (propsZero !== undefined)
            (
                vm as unknown as { _$applyProps(props: unknown): void }
            )._$applyProps(propsZero);
        return { vm };
    });

    (result.vm as unknown as { _$observeRefresh(): void })._$observeRefresh();

    const [initError, setInitError] = useState<unknown>(null);

    // Re-apply props in an effect, not during render: mutating the observable
    // _$props mid-render is a MobX anti-pattern. _$props is observable.struct, so
    // MobX dedupes structurally-equal props and only reacts on an actual change.
    // onPropsChanged() is awaited and its errors surfaced to the boundary, like init().
    useEffect(() => {
        if (propsZero === undefined) return;
        const changed = (
            result.vm as unknown as {
                _$applyProps(props: unknown): boolean;
            }
        )._$applyProps(propsZero);
        if (!changed) return;

        void (async () => {
            try {
                await (
                    result.vm as unknown as {
                        onPropsChanged(): void | Promise<void>;
                    }
                ).onPropsChanged();
            } catch (err) {
                if (!result.vm.isDisposed) setInitError(err);
            }
        })();
    }, [propsZero, result.vm]);

    const didInit = useRef(false);
    const pendingCleanup = useRef<ReturnType<typeof setTimeout> | null>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: result is stable from useState; effect is mount/unmount only.
    useEffect(() => {
        if (pendingCleanup.current !== null) {
            clearTimeout(pendingCleanup.current);
            pendingCleanup.current = null;
        }

        if (!didInit.current) {
            didInit.current = true;
            void (async () => {
                try {
                    await result.vm.init();
                } catch (err) {
                    if (!result.vm.isDisposed) setInitError(err);
                }
            })();
        }

        // setTimeout(0) defers teardown so StrictMode's remount can cancel it
        // (it fires only on a real unmount); didInit keeps init() from re-running.
        return () => {
            pendingCleanup.current = setTimeout(() => {
                void result.vm.dispose();
            }, 0);
        };
    }, []);

    if (initError !== null) throw initError;

    return result;
}
