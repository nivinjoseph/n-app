import { ViewModel } from "./view-model.js";
export declare abstract class PageViewModel<TParams extends Record<string, unknown> = never> extends ViewModel {
    static readonly $mobxOverrides: Record<string, unknown>;
    private readonly _$navService;
    private readonly _$routeInfo;
    private _$rawPathParams;
    private _$rawQueryParams;
    private _$paramsApplied;
    protected retrieveParams(): TParams;
    goTo(path: string, options?: {
        replace?: boolean;
    }): void;
    goBack(): void;
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
    protected onParamsChanged(): void | Promise<void>;
    private _$applyRawParams;
}
//# sourceMappingURL=page-view-model.d.ts.map