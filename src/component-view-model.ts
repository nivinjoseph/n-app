import { action, comparer, observable } from "mobx";
import { ViewModel } from "./view-model.js";

const PROPS_NOT_INJECTED =
    "Props not injected on ComponentViewModel. Components must be resolved through useComponentViewModel.";

export abstract class ComponentViewModel<
    TProps extends Record<string, unknown> = never,
> extends ViewModel {
    public static override readonly $mobxOverrides: Record<string, unknown> = {
        _$props: observable.struct,
        retrieveProps: false,
        // A true mutator, and the hook calls it from the useState initializer —
        // i.e. inside an observer's render derivation. Methods are auto actions
        // by default, which do not untrack inside a derivation, so mutating
        // _$props there would trip enforceActions. A plain action always
        // untracks and always allows the write.
        _$applyProps: action.bound,
    };

    private _$props: TProps | null = null;

    protected retrieveProps(): TProps {
        if (this._$props == null) throw new Error(PROPS_NOT_INJECTED);
        return this._$props;
    }

    /**
     * Override to react to a prop change on an already-mounted component (props
     * applied without a remount). The framework calls this after applying the new
     * props, and only when they actually change (structural comparison). `init()`
     * still does the initial load; use this to re-run prop-dependent loads. Guard
     * async reloads against out-of-order resolution with a per-load token (see
     * PageViewModel.onParamsChanged for the pattern).
     */
    protected onPropsChanged(): void | Promise<void> {}

    // Returns true when props actually changed, so the hook can invoke
    // onPropsChanged() in an awaited, error-surfaced context (parallel to init()).
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Called by force in hook
    private _$applyProps(props: TProps): boolean {
        const changed =
            this._$props !== null && !comparer.structural(this._$props, props);
        this._$props = props;
        return changed;
    }
}
