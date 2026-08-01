import { createAtom, observe, runInAction } from "mobx";
export class ViewModel {
    static $mobxOverrides = {
        _refreshAtom: false,
        _$observeRefresh: false,
        _observeDisposer: false,
    };
    _isDisposed = false;
    _refreshAtom = createAtom(this.constructor.name);
    _observeDisposer = null;
    get isDisposed() {
        return this._isDisposed;
    }
    runAfterAwait(callback) {
        return runInAction(callback);
    }
    init() {
        // console.log(`init ${this.getTypeName()}`);
    }
    dispose() {
        // console.log(`dispose ${this.getTypeName()}`);
        if (this._isDisposed)
            return;
        this._isDisposed = true;
        this._observeDisposer?.();
        this._observeDisposer = null;
    }
    forceRefresh() {
        this._refreshAtom.reportChanged();
    }
    onObservableChanged() { }
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Called by hook via cast
    _$observeRefresh() {
        this._refreshAtom.reportObserved();
    }
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Called by hook via cast
    _$startObserving() {
        if (this._observeDisposer !== null)
            return;
        this._observeDisposer = observe(this, () => {
            this.onObservableChanged();
        });
    }
}
//# sourceMappingURL=view-model.js.map