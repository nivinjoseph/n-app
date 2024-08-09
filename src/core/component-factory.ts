import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";
import type { Scope } from "@nivinjoseph/n-ject";
import { type ComponentOptions, type ComponentPropsOptions, type Prop, type Ref, type UnwrapRef, inject, ref } from "vue";
import { ComponentRegistration } from "./component-registration.js";
import type { ComponentViewModel } from "./component-view-model.js";
import { Utilities } from "./utilities.js";


export class ComponentFactory
{
    public create(registration: ComponentRegistration): Object
    {
        given(registration, "registration").ensureHasValue();
        const component: ComponentOptions = {
            name: registration.name,
            props: this._createComponentPropsOptions(registration),

            // This might break when updating vue. UPDATE WITH CAUTION!
            setup: function <T extends ComponentViewModel>(): { nAppVm: Ref<UnwrapRef<T>>; }
            {
                // console.log("setup for ", registration.name, this);

                const container: Scope | undefined = inject("pageScopeContainer") ?? inject("rootScopeContainer");
                if (container == null)
                    throw new ApplicationException("Could not get pageScopeContainer or rootScopeContainer.");

                const nAppVm = container.resolve<T>(registration.name);

                return {
                    nAppVm: ref(nAppVm)
                };
            },
            beforeCreate: function <T extends ComponentViewModel>()
            {
                // console.log("beforeCreate for ", registration.name, this);

                const vm = this.nAppVm as T;

                const methods: { [index: string]: Function; } = {};
                const computed: { [index: string]: { get?(): any; set?(val: any): void; }; } = {};

                const propertyInfos = Utilities.getPropertyInfos(vm);
                for (const info of propertyInfos)
                {
                    if (typeof info.descriptor.value === "function")
                        methods[info.name] = (info.descriptor.value as Function).bind(vm);
                    else if (info.descriptor.get || info.descriptor.set)
                    {
                        computed[info.name] = {
                            get: info.descriptor.get ? info.descriptor.get.bind(vm) : undefined,
                            set: info.descriptor.set ? info.descriptor.set.bind(vm) : undefined
                        };
                    }
                }

                this.$options.methods = methods;
                this.$options.computed = computed;
                this.$options.emits = registration.events;

                (<any>vm)._ctx = this;
                (<any>vm)._bindings = registration.bindings.map(t => t.name);
                (<any>vm)._events = registration.events;
            },

            created: function ()
            {
                if (this.nAppVm.onCreate)
                {
                    if (registration.persist && registration.isCreated)
                    {
                        // no op
                    }
                    else
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        this.nAppVm.onCreate();
                }

                registration.created();
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            beforeMount: function ()
            {
                // console.log("beforeMount for ", registration.name, this);
            },
            mounted: function ()
            {
                // console.log("mounted for ", registration.name, this);

                if (this.nAppVm.onMount)
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    this.nAppVm.onMount(this.$el);
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            beforeUpdate: function ()
            {
                // console.log("beforeUpdate for ", registration.name, this);
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            updated: function ()
            {
                // console.log("updated for ", registration.name, this);
            },
            beforeUnmount: function ()
            {
                // console.log("beforeUnmount for ", registration.name, this);

                if (this.nAppVm.onDismount)
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    this.nAppVm.onDismount();
            },
            unmounted: function ()
            {
                // console.log("unmounted for ", registration.name, this);
                if (this.nAppVm.onDestroy && !registration.persist)
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    this.nAppVm.onDestroy();

                this.nAppVm._ctx.$options.methods = null;
                this.nAppVm._ctx.$options.computed = null;
                // this.vm._ctx = null;
                this.nAppVm = null;
            },
            activated: function ()
            {
                // console.log("activated", registration.name);
            },
            deactivated: function ()
            {
                // console.log("deactivated", registration.name);
            },
            data: function (vm)
            {
                // console.log("data", vm);
                // don't need this here but exposing it so we can check the properties
                // when using vue dev tools in the browsers.
                return {
                    vm: vm.nAppVm
                };
            }
        };

        if (typeof registration.template === "string")
            component.template = registration.template;
        else
            component.render = registration.template;


        if (registration.localComponentRegistrations.isNotEmpty)
        {
            const components = registration.localComponentRegistrations
                .reduce<Record<string, ComponentOptions>>((acc, t) =>
                {
                    acc[t.element] = this.create(t);
                    return acc;
                }, {});

            component.components = components;
        }

        // console.log(component);
        return component;
    }


    private _createComponentPropsOptions(registration: ComponentRegistration): ComponentPropsOptions | undefined
    {
        given(registration, "registration").ensureHasValue().ensureIsObject();


        if (registration.bindings.isEmpty)
            return undefined;


        return registration.bindings
            .reduce((acc, t) =>
            {
                // const types = ["string", "boolean", "number", "function", "array", "object"];

                const propSchema: Prop<any> = {};
                const isOptional = t.name === "model" ? true : t.isOptional;
                propSchema.required = !isOptional;

                if (typeof t.type === "string")
                {
                    const type = t.type.trim().toLowerCase();
                    switch (type)
                    {
                        case "string":
                            propSchema.type = String;
                            break;
                        case "boolean":
                            propSchema.type = Boolean;
                            break;
                        case "number":
                            propSchema.type = Number;
                            break;
                        case "function":
                            propSchema.type = Function;
                            break;
                        case "array":
                            propSchema.type = Array;
                            break;
                        case "object":
                            propSchema.type = Object;
                            break;
                        case "any":
                            propSchema.type = null;
                            break;
                        default:
                            throw new Error(`Unsupported binding prop type '${type}'`);
                    }
                }
                else if (typeof t.type === "function")
                    propSchema.type = t.type;
                else if (Array.isArray(t.type))
                    propSchema.type = Array;
                else if (typeof t.type === "object")
                    propSchema.type = Object;
                else
                    throw new Error(`Unsupported binding prop type '${t.type}'`);

                const validationSchema: Record<string, any> = {
                    [registration.name]: {
                        "props": {
                            [isOptional ? t.name + "?" : t.name]: t.type
                        }
                    }
                };

                // const longName = `${registration.name}.props.${t.name}`;

                propSchema.validator = (value: any): boolean | never =>
                {
                    given({
                        [registration.name]: {
                            "props": {
                                [t.name]: value
                            }
                        }
                    }, t.name)
                        .ensureHasStructure(validationSchema);

                    return true;
                };

                const name = t.name === "model" ? "modelValue" : t.name;
                // @ts-expect-error it's fine
                acc[name] = propSchema;

                return acc;
            }, {});


    }
}