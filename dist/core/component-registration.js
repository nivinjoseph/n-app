import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { bindSymbol } from "./bind.js";
import { elementSymbol } from "./element.js";
import { eventsSymbol } from "./events.js";
import { Utilities } from "./utilities.js";
import { ViewModelRegistration } from "./view-model-registration.js";
import { componentsSymbol } from "./components.js";
export class ComponentRegistration extends ViewModelRegistration {
    _element;
    _bindings = new Array();
    _bindingSchema = {};
    _hasModel;
    _events = new Array();
    _localComponentRegistrations = new Array();
    get element() { return this._element; }
    get bindings() { return this._bindings; }
    get bindingSchema() { return this._bindingSchema; }
    get hasModel() { return this._hasModel; }
    get events() { return this._events; }
    get localComponentRegistrations() { return this._localComponentRegistrations; }
    constructor(component) {
        given(component, "component").ensureHasValue();
        super(component);
        const metadata = component[Symbol.metadata];
        const element = metadata[elementSymbol];
        if (element == null)
            throw new ApplicationException(`ComponentViewModel '${this.name}' does not have @element applied.`);
        this._element = element;
        const bindingSchema = metadata[bindSymbol];
        if (bindingSchema != null) {
            Object.keys(bindingSchema).forEach(key => {
                let name = key.trim();
                let isOptional = false;
                if (name.endsWith("?")) {
                    name = name.substring(0, name.length - 1);
                    isOptional = true;
                }
                this._bindings.push({
                    name,
                    isOptional,
                    type: bindingSchema[key]
                });
            });
            const forbidden = [...Utilities.forbidden, "value", "modelValue"];
            given(this._bindings, "bindings")
                .ensure(t => t.length === t.distinct(u => u.name).length, `duplicate binding declarations detected in ${this.name} binding schema`)
                .ensure(t => t.some(u => u.name === "model") ? !t.find(u => u.name === "model").isOptional : true, "model cannot be declared as optional")
                // .ensure(t => t.every(u => u.name !== "value"), "using forbidden keyword 'value' in binding schema")
                .ensure(t => t.every(u => !forbidden.contains(u.name)), `using forbidden keyword in binding schema, the following names are forbidden: ${forbidden}.`);
            this._bindingSchema = bindingSchema;
        }
        this._hasModel = this._bindings.some(t => t.name === "model");
        const events = metadata[eventsSymbol];
        if (events != null)
            this._events.push(...events);
        if (this._hasModel)
            this._events.push("update:modelValue");
        const components = metadata[componentsSymbol];
        if (components != null && components.isNotEmpty) {
            components.forEach(component => {
                const registration = new ComponentRegistration(component);
                if (this._localComponentRegistrations.some(t => t.name === registration.name))
                    throw new ApplicationException(`Duplicate Local Component registration with name '${registration.name}' for Parent Component '${this.name}'.`);
                if (this._localComponentRegistrations.some(t => t.element === registration.element))
                    throw new ApplicationException(`Duplicate Local Component registration with element '${registration.element}' for Parent Component '${this.name}'`);
                this._localComponentRegistrations.push(registration);
            });
        }
    }
}
//# sourceMappingURL=component-registration.js.map