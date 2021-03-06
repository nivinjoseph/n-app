"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentViewModel = void 0;
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const n_exception_1 = require("@nivinjoseph/n-exception");
const base_view_model_1 = require("./base-view-model");
const component_registration_1 = require("./component-registration");
const component_factory_1 = require("./component-factory");
// public
class ComponentViewModel extends base_view_model_1.BaseViewModel {
    get _myBindings() { return this["_bindings"]; }
    get _myEvents() { return this["_events"]; }
    getBound(propertyName) {
        if (!this.ctx)
            throw new n_exception_1.InvalidOperationException("calling getBound() in the constructor");
        n_defensive_1.given(propertyName, "propertyName").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace())
            .ensure(t => this._myBindings.some(u => u === t), `No binding with the name '${propertyName}' found`);
        return this.ctx[propertyName];
    }
    getBoundModel() {
        if (!this.ctx)
            throw new n_exception_1.InvalidOperationException("calling getBoundModel() in the constructor");
        if (!this._myBindings.some(t => t === "value"))
            throw new n_exception_1.InvalidOperationException("calling getBoundModel() without defining 'value' in bind");
        return this.ctx["value"];
    }
    setBoundModel(value) {
        if (!this.ctx)
            throw new n_exception_1.InvalidOperationException("calling setBoundModel() in the constructor");
        if (!this._myBindings.some(t => t === "value"))
            throw new n_exception_1.InvalidOperationException("calling setBoundModel() without defining 'value' in bind");
        this.ctx.$emit("input", value);
    }
    emit(event, ...eventArgs) {
        n_defensive_1.given(event, "event").ensureHasValue().ensureIsString()
            .ensure(t => this._myEvents.contains(t.trim()), "undeclared event");
        event = this._camelCaseToKebabCase(event);
        this.ctx.$emit(event, ...eventArgs);
    }
    static createComponentOptions(component) {
        n_defensive_1.given(component, "component").ensureHasValue().ensureIsFunction();
        const registration = new component_registration_1.ComponentRegistration(component);
        const factory = new component_factory_1.ComponentFactory();
        return factory.create(registration);
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
exports.ComponentViewModel = ComponentViewModel;
//# sourceMappingURL=component-view-model.js.map