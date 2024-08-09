import { given } from "@nivinjoseph/n-defensive";
import { InvalidOperationException } from "@nivinjoseph/n-exception";
import { BaseViewModel } from "./base-view-model.js";
// public
export class ComponentViewModel extends BaseViewModel {
    get _myBindings() { return this["_bindings"]; }
    get _myEvents() { return this["_events"]; }
    get _myProps() { return this.ctx.$props; }
    getBound(propertyName) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this.ctx)
            throw new InvalidOperationException("calling getBound() in the constructor");
        given(propertyName, "propertyName").ensureHasValue()
            .ensure(t => this._myBindings.contains(t), `No binding with the name '${propertyName}' found`);
        return this._myProps[propertyName];
    }
    getBoundModel() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this.ctx)
            throw new InvalidOperationException("calling getBoundModel() in the constructor");
        if (!this._myBindings.contains("model"))
            throw new InvalidOperationException("calling getBoundModel() without defining 'model' in bind");
        return this._myProps["modelValue"];
    }
    setBoundModel(value) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this.ctx)
            throw new InvalidOperationException("calling setBoundModel() in the constructor");
        if (!this._myBindings.contains("model"))
            throw new InvalidOperationException("calling setBoundModel() without defining 'model' in bind");
        this.ctx.$emit("update:modelValue", value);
    }
    emit(event, ...eventArgs) {
        given(event, "event").ensureHasValue().ensureIsString()
            .ensure(t => this._myEvents.contains(t.trim()), "undeclared event");
        event = this._camelCaseToKebabCase(event);
        this.ctx.$emit(event, ...eventArgs);
    }
    _camelCaseToKebabCase(value) {
        let eventName = value.trim();
        const re = /[A-Z]/g;
        let index = eventName.search(re);
        while (index !== -1) {
            const char = eventName[index];
            const replacement = "-" + char.toLowerCase();
            eventName = eventName.replace(char, replacement);
            index = eventName.search(re);
        }
        return eventName;
    }
}
//# sourceMappingURL=component-view-model.js.map