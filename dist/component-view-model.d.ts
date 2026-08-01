import { ViewModel } from "./view-model.js";
export declare abstract class ComponentViewModel<TProps extends Record<string, unknown> = never> extends ViewModel {
    static readonly $mobxOverrides: Record<string, unknown>;
    private _$props;
    protected retrieveProps(): TProps;
    /**
     * Override to react to a prop change on an already-mounted component (props
     * applied without a remount). The framework calls this after applying the new
     * props, and only when they actually change (structural comparison). `init()`
     * still does the initial load; use this to re-run prop-dependent loads. Guard
     * async reloads against out-of-order resolution with a per-load token (see
     * PageViewModel.onParamsChanged for the pattern).
     */
    protected onPropsChanged(): void | Promise<void>;
    private _$applyProps;
}
//# sourceMappingURL=component-view-model.d.ts.map