import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { bindSymbol } from "./bind.js";
import type { ComponentViewModelClass } from "./component-view-model.js";
import { elementSymbol } from "./element.js";
import { eventsSymbol } from "./events.js";
import { Utilities } from "./utilities.js";
import { ViewModelRegistration } from "./view-model-registration.js";
import { componentsSymbol } from "./components.js";


export class ComponentRegistration extends ViewModelRegistration
{
    private readonly _element: string;
    private readonly _bindings = new Array<ComponentBindingInfo>();
    private readonly _bindingSchema: object = {};
    private readonly _hasModel: boolean;
    private readonly _events = new Array<string>();
    private readonly _localComponentRegistrations = new Array<ComponentRegistration>();


    public get element(): string { return this._element; }
    public get bindings(): Array<ComponentBindingInfo> { return this._bindings; }
    public get bindingSchema(): object { return this._bindingSchema; }
    public get hasModel(): boolean { return this._hasModel; }
    public get events(): Array<string> { return this._events; }
    public get localComponentRegistrations(): Array<ComponentRegistration> { return this._localComponentRegistrations; }


    public constructor(component: ComponentViewModelClass<any>)
    {
        given(component, "component").ensureHasValue();

        super(component);

        const metadata = component[Symbol.metadata]!;

        const element = metadata[elementSymbol] as string | undefined;
        if (element == null)
            throw new ApplicationException(`ComponentViewModel '${this.name}' does not have @element applied.`);

        this._element = element;

        const bindingSchema = metadata[bindSymbol] as Record<string, any> | undefined;
        if (bindingSchema != null)
        {
            Object.keys(bindingSchema).forEach(key =>
            {
                let name = key.trim();
                let isOptional = false;
                if (name.endsWith("?"))
                {
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
                .ensure(t => t.length === t.distinct(u => u.name).length,
                    `duplicate binding declarations detected in ${this.name} binding schema`)
                .ensure(t => t.some(u => u.name === "model") ? !t.find(u => u.name === "model")!.isOptional : true,
                    "model cannot be declared as optional")
                // .ensure(t => t.every(u => u.name !== "value"), "using forbidden keyword 'value' in binding schema")
                .ensure(t => t.every(u => !forbidden.contains(u.name)),
                    `using forbidden keyword in binding schema, the following names are forbidden: ${forbidden}.`);

            this._bindingSchema = bindingSchema;
        }

        this._hasModel = this._bindings.some(t => t.name === "model");

        const events = metadata[eventsSymbol] as ReadonlyArray<string> | undefined;
        if (events != null)
            this._events.push(...events);

        if (this._hasModel)
            this._events.push("update:modelValue");

        const components = metadata[componentsSymbol] as ReadonlyArray<ComponentViewModelClass<any>> | undefined;
        if (components != null && components.isNotEmpty)
        {
            components.forEach(component =>
            {
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

export interface ComponentBindingInfo
{
    name: string;
    isOptional: boolean;
    type: any;
}