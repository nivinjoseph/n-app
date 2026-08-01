import { useEffect, useRef, useState } from "react";
import { autoMakeObservable } from "./auto-make-observable.js";
import { useNavigation, } from "./navigation.js";
import { PageRegistration } from "./page-registration.js";
import { useRootContext } from "./root-context.js";
import { Utils } from "./utils.js";
// biome-ignore lint/suspicious/noExplicitAny: framework hook needs variance-free base reference
export function usePageViewModel(pageViewModelType) {
    const rootCtx = useRootContext();
    const navigation = useNavigation();
    const [result] = useState(() => {
        const registration = PageRegistration.find(pageViewModelType);
        if (registration == null)
            throw new Error(`PageRegistration for '${Utils.getTypeName(pageViewModelType)}' not found. Is the page covered by ClientApp's discoverPages globs (or an explicit registerPages call)?`);
        const ctx = rootCtx.createScope();
        const vm = ctx.resolve(Utils.getTypeName(pageViewModelType));
        autoMakeObservable(vm);
        vm._$startObserving();
        vm._$routeInfo =
            registration.route;
        vm._$applyRawParams(navigation.retrieveRawPathParams(), navigation.retrieveRawQueryParams());
        return { vm, ctx };
    });
    result.vm._$navService = navigation;
    result.vm._$observeRefresh();
    const [initError, setInitError] = useState(null);
    useEffect(() => {
        const changed = result.vm._$applyRawParams(navigation.retrieveRawPathParams(), navigation.retrieveRawQueryParams());
        if (!changed)
            return;
        // onParamsChanged() is awaited and its errors surfaced to the boundary,
        // exactly like init() — hence it lives here, not inside the action above.
        void (async () => {
            try {
                await result.vm.onParamsChanged();
            }
            catch (err) {
                if (!result.vm.isDisposed)
                    setInitError(err);
            }
        })();
    }, [navigation, result.vm]);
    const didInit = useRef(false);
    const pendingCleanup = useRef(null);
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
                }
                catch (err) {
                    if (!result.vm.isDisposed)
                        setInitError(err);
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
    if (initError !== null)
        throw initError;
    return result;
}
//# sourceMappingURL=use-page-view-model.js.map