import { comparer, observable } from "mobx";
import { ViewModel } from "./view-model.js";
const PROPS_NOT_INJECTED = "Props not injected on ComponentViewModel. Components must be resolved through useComponentViewModel.";
export class ComponentViewModel extends ViewModel {
    static $mobxOverrides = {
        _$props: observable.struct,
        retrieveProps: false,
    };
    _$props = null;
    retrieveProps() {
        if (this._$props == null)
            throw new Error(PROPS_NOT_INJECTED);
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
    onPropsChanged() { }
    // Returns true when props actually changed, so the hook can invoke
    // onPropsChanged() in an awaited, error-surfaced context (parallel to init()).
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Called by force in hook
    _$applyProps(props) {
        const changed = this._$props !== null && !comparer.structural(this._$props, props);
        this._$props = props;
        return changed;
    }
}
//# sourceMappingURL=component-view-model.js.map