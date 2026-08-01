import type { ClassDefinition } from "@nivinjoseph/n-util";
import { useEffect, useRef, useState } from "react";
import { autoMakeObservable } from "./auto-make-observable.js";
import {
    type NavigationService,
    type RawParams,
    useNavigation,
} from "./navigation.js";
import type { PageScope } from "./page-context.js";
import { PageRegistration } from "./page-registration.js";
import type { PageViewModel } from "./page-view-model.js";
import { useRootContext } from "./root-context.js";
import type { RouteInfo } from "./route-info.js";
import { Utils } from "./utils.js";

// biome-ignore lint/suspicious/noExplicitAny: framework hook needs variance-free base reference
export interface UsePageViewModelResult<T extends PageViewModel<any>> {
    readonly vm: T;
    readonly ctx: PageScope;
}

// biome-ignore lint/suspicious/noExplicitAny: framework hook needs variance-free base reference
export function usePageViewModel<T extends PageViewModel<any>>(
    pageViewModelType: ClassDefinition<T>,
): UsePageViewModelResult<T> {
    const rootCtx = useRootContext();
    const navigation = useNavigation();

    const [result] = useState<UsePageViewModelResult<T>>(() => {
        const registration = PageRegistration.find(pageViewModelType);
        if (registration == null)
            throw new Error(
                `PageRegistration for '${Utils.getTypeName(pageViewModelType)}' not found. Is the page covered by ClientApp's discoverPages globs (or an explicit registerPages call)?`,
            );

        const ctx = rootCtx.createScope() as PageScope;
        const vm = ctx.resolve<T>(Utils.getTypeName(pageViewModelType));
        autoMakeObservable(vm);
        (vm as unknown as { _$startObserving(): void })._$startObserving();
        (vm as unknown as { _$routeInfo: RouteInfo | null })._$routeInfo =
            registration.route;
        (
            vm as unknown as {
                _$applyRawParams(p: RawParams, q: RawParams): void;
            }
        )._$applyRawParams(
            navigation.retrieveRawPathParams(),
            navigation.retrieveRawQueryParams(),
        );
        return { vm, ctx };
    });

    (
        result.vm as unknown as { _$navService: NavigationService | null }
    )._$navService = navigation;

    (result.vm as unknown as { _$observeRefresh(): void })._$observeRefresh();

    const [initError, setInitError] = useState<unknown>(null);

    useEffect(() => {
        const changed = (
            result.vm as unknown as {
                _$applyRawParams(p: RawParams, q: RawParams): boolean;
            }
        )._$applyRawParams(
            navigation.retrieveRawPathParams(),
            navigation.retrieveRawQueryParams(),
        );
        if (!changed) return;

        // onParamsChanged() is awaited and its errors surfaced to the boundary,
        // exactly like init() — hence it lives here, not inside the action above.
        void (async () => {
            try {
                await (
                    result.vm as unknown as {
                        onParamsChanged(): void | Promise<void>;
                    }
                ).onParamsChanged();
            } catch (err) {
                if (!result.vm.isDisposed) setInitError(err);
            }
        })();
    }, [navigation, result.vm]);

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
        // ctx.dispose() cascades to vm.dispose(), so vm.isDisposed is the liveness check.
        return () => {
            pendingCleanup.current = setTimeout(() => {
                void result.ctx.dispose();
            }, 0);
        };
    }, []);

    if (initError !== null) throw initError;

    return result;
}
