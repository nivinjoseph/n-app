import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
export class BaseViewModel {
    _watches = {};
    _executeOnCreate = null;
    _executeOnDestroy = null;
    _domElement;
    get domElement() { return this._domElement; }
    get ctx() {
        return this["_ctx"];
    }
    /** Override */
    onCreate() {
        if (this._executeOnCreate)
            this._executeOnCreate();
    }
    /** Override */
    onMount(element) {
        given(element, "element").ensureHasValue().ensureIsObject();
        this._domElement = element;
    }
    /** Override */
    onDismount() {
        // deliberate empty
    }
    /** Override */
    onDestroy() {
        for (const key in this._watches) {
            const unwatch = this._watches[key];
            if (unwatch != null) {
                unwatch();
                this._watches[key] = undefined;
            }
        }
        if (this._executeOnDestroy)
            this._executeOnDestroy();
    }
    executeOnCreate(funcToExecute) {
        given(funcToExecute, "funcToExecute").ensureHasValue();
        this._executeOnCreate = funcToExecute;
    }
    executeOnDestroy(funcToExecute) {
        given(funcToExecute, "funcToExecute").ensureHasValue();
        this._executeOnDestroy = funcToExecute;
    }
    watch(propertyName, callback) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        given(this, "this").ensure(t => t.ctx != null, "cannot invoke in the constructor");
        given(propertyName, "propertyName").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        propertyName = propertyName.trim();
        if (this._watches[propertyName])
            throw new ApplicationException(`Watch already defined for property '${propertyName}'.`);
        this._watches[propertyName] = this.ctx.$watch(propertyName, function (newVal, oldVal) {
            callback(newVal, oldVal);
        }, { deep: true });
    }
    unWatch(propertyName) {
        given(propertyName, "propertyName").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        propertyName = propertyName.trim();
        const unwatch = this._watches[propertyName];
        if (unwatch != null) {
            unwatch();
            this._watches[propertyName] = undefined;
        }
    }
}
//# sourceMappingURL=base-view-model.js.map