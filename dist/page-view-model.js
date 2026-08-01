import { comparer, observable } from "mobx";
import { ViewModel } from "./view-model.js";
const NAV_NOT_INJECTED = "NavigationService not injected on PageViewModel. Pages must be resolved through usePageViewModel.";
const ROUTE_NOT_INJECTED = "RouteInfo not injected on PageViewModel. Pages must be resolved through usePageViewModel.";
export class PageViewModel extends ViewModel {
    static $mobxOverrides = {
        _$navService: false,
        _$routeInfo: false,
        _$rawPathParams: observable.ref,
        _$rawQueryParams: observable.ref,
        _$paramsApplied: false,
        retrieveParams: false,
    };
    _$navService = null;
    _$routeInfo = null;
    _$rawPathParams = {};
    _$rawQueryParams = {};
    _$paramsApplied = false;
    retrieveParams() {
        if (this._$routeInfo == null)
            throw new Error(ROUTE_NOT_INJECTED);
        const result = {};
        for (const routeParam of this._$routeInfo.params) {
            const source = routeParam.isQuery
                ? this._$rawQueryParams
                : this._$rawPathParams;
            const rawValue = source[routeParam.paramKey] ?? null;
            result[routeParam.paramKey] = routeParam.parseParam(rawValue);
        }
        return result;
    }
    goTo(path, options) {
        if (this._$navService == null)
            throw new Error(NAV_NOT_INJECTED);
        this._$navService.goTo(path, options);
    }
    goBack() {
        if (this._$navService == null)
            throw new Error(NAV_NOT_INJECTED);
        this._$navService.goBack();
    }
    /**
     * Override to react to a route param change that happens *without* a remount
     * (e.g. /edit/A → /edit/B on the same route). The framework calls this after
     * applying the new params, and only when the parsed params actually change
     * (structural comparison). `init()` still does the initial load; use this to
     * re-run param-dependent loads.
     *
     * Reloads are async, so guard against out-of-order resolution (A→B→C where an
     * older request resolves last) with a per-load token:
     *
     *   protected override onParamsChanged(): void {
     *       const token = ++this._loadToken;
     *       void this._load(this.retrieveParams().id, token);
     *   }
     *   private async _load(id: string, token: number): Promise<void> {
     *       const todo = await this._service.get(id);
     *       if (token !== this._loadToken) return; // superseded by a newer load
     *       this.runAfterAwait(() => { this._todo = todo; });
     *   }
     */
    onParamsChanged() { }
    // Returns true when the parsed params actually changed, so the hook can invoke
    // onParamsChanged() in an awaited, error-surfaced context (parallel to init()).
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Called by hook via cast
    _$applyRawParams(pathParams, queryParams) {
        const previous = this._$paramsApplied ? this.retrieveParams() : null;
        this._$rawPathParams = pathParams;
        this._$rawQueryParams = queryParams;
        this._$paramsApplied = true;
        return (previous !== null &&
            !comparer.structural(previous, this.retrieveParams()));
    }
}
//# sourceMappingURL=page-view-model.js.map