export declare abstract class ViewModel {
    static readonly $mobxOverrides: Record<string, unknown>;
    private _isDisposed;
    private readonly _refreshAtom;
    private _observeDisposer;
    get isDisposed(): boolean;
    protected runAfterAwait<T>(callback: () => T): T;
    init(): void | Promise<void>;
    dispose(): void | Promise<void>;
    protected forceRefresh(): void;
    protected onObservableChanged(): void;
    private _$observeRefresh;
    private _$startObserving;
}
//# sourceMappingURL=view-model.d.ts.map