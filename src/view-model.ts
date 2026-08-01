import { createAtom, type IAtom, observe, runInAction } from "mobx";

export abstract class ViewModel {
    public static readonly $mobxOverrides: Record<string, unknown> = {
        _refreshAtom: false,
        _$observeRefresh: false,
        _observeDisposer: false,
    };

    private _isDisposed: boolean = false;
    private readonly _refreshAtom: IAtom = createAtom(this.constructor.name);
    private _observeDisposer: (() => void) | null = null;

    public get isDisposed(): boolean {
        return this._isDisposed;
    }

    protected runAfterAwait<T>(callback: () => T): T {
        return runInAction(callback);
    }

    public init(): void | Promise<void> {
        // console.log(`init ${this.getTypeName()}`);
    }

    public dispose(): void | Promise<void> {
        // console.log(`dispose ${this.getTypeName()}`);

        if (this._isDisposed) return;
        this._isDisposed = true;
        this._observeDisposer?.();
        this._observeDisposer = null;
    }

    protected forceRefresh(): void {
        this._refreshAtom.reportChanged();
    }

    protected onObservableChanged(): void {}

    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Called by hook via cast
    private _$observeRefresh(): void {
        this._refreshAtom.reportObserved();
    }

    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Called by hook via cast
    private _$startObserving(): void {
        if (this._observeDisposer !== null) return;
        this._observeDisposer = observe(this, () => {
            this.onObservableChanged();
        });
    }
}
