import { given } from "@nivinjoseph/n-defensive";
import { Container, Scope } from "@nivinjoseph/n-ject";
import { Utilities } from "./utilities";
import { ComponentRegistration } from "./component-registration";
import "@nivinjoseph/n-ext";
import { ApplicationException } from "@nivinjoseph/n-exception";


export class ComponentFactory
{
    public create(registration: ComponentRegistration): Object
    {
        given(registration, "registration").ensureHasValue();

        const component: any = {};

        // component.template = registration.template;

        // component.render = (<any>registration.viewModel).___render;
        // component.staticRenderFns = (<any>registration.viewModel).___staticRenderFns;

        if (typeof registration.template === "string")
        {
            component.template = registration.template;
        }
        else
        {
            component.render = registration.template.render;
            component.staticRenderFns = registration.template.staticRenderFns;
        }

        if (registration.bindings.isNotEmpty)
        {
            component.props = registration.bindings
                .reduce<Record<string, any>>((acc, t) =>
                {
                    // const types = ["string", "boolean", "number", "function", "array", "object"];

                    const propSchema: Record<string, any> = {};
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
                                // https://github.com/vuejs/vue/issues/4792
                                propSchema.default = undefined;
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

                    acc[t.name === "model" ? "value" : t.name] = propSchema;

                    return acc;
                }, {});
        }

        component.inject = ["pageScopeContainer", "rootScopeContainer"];

        component.data = function (): { vm: any; }
        {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const vueVm = this;

            // console.log("INVOKED component");

            const container: Scope | null = vueVm.pageScopeContainer || vueVm.rootScopeContainer;
            if (!container)
                throw new ApplicationException("Could not get pageScopeContainer or rootScopeContainer.");

            if (component.___reload)
            {
                const c = container as Container;
                // @ts-expect-error: deliberately accessing protected member
                const cReg = c.componentRegistry.find(registration.name)!;
                // @ts-expect-error: deliberately accessing private member
                cReg._component = component.___viewModel;
                // @ts-expect-error: deliberate calling private method and accessing private member
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                cReg._dependencies = cReg._getDependencies();
                // registration.reload(component.___viewModel);

                component.___reload = false;
            }

            const vm = container.resolve<any>(registration.name);

            const data = { vm: vm };
            const methods: { [index: string]: any; } = {};
            const computed: { [index: string]: any; } = {};

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

            vueVm.$options.methods = methods;
            vueVm.$options.computed = computed;
            vm._ctx = vueVm;
            vm._bindings = component.props ? [...registration.bindings.map(t => t.name)] : [];

            vm._events = registration.events;

            return data;
        };


        component.beforeCreate = function (): void
        {
            // if (registration.bindings.isNotEmpty)
            //     given(this.$options.propsData as object, "boundData").ensureHasValue().ensureIsObject()
            //         .ensureHasStructure(registration.bindingSchema as any);

            // console.log("executing beforeCreate");
            // console.log(Object.keys(this));
            // console.log(this.$options);
        };

        component.created = function (): void
        {
            // if (registration.bindings.isNotEmpty)
            //     given(this.$options.propsData as object, "propsData").ensureHasValue().ensureIsObject()
            //         .ensureHasStructure(registration.bindingSchema as any);

            // console.log("executing created");
            // console.log(this.vm);

            if (this.vm.onCreate)
            {
                if (registration.persist && registration.isCreated)
                {
                    // no op
                }
                else
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    this.vm.onCreate();
            }

            registration.created();
        };

        component.beforeMount = function (): void
        {
            // console.log("executing beforeMount");
            // console.log(this.vm);
        };

        component.mounted = function (): void
        {
            // console.log("executing mounted");
            // console.log(this.vm);

            if (this.vm.onMount)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                this.vm.onMount(this.$el);
        };

        component.beforeUpdate = function (): void
        {
            // console.log("executing beforeUpdate");
            // console.log(this.vm);
        };

        component.updated = function (): void
        {
            // console.log("executing updated");
            // console.log(this.vm);
        };

        component.beforeDestroy = function (): void
        {
            // console.log("executing beforeDestroy");
            // console.log(this.vm);

            if (this.vm.onDismount)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                this.vm.onDismount();
        };

        component.destroyed = function (): void
        {
            // console.log("executing destroyed");
            // console.log(this.vm);

            if (this.vm.onDestroy && !registration.persist)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                this.vm.onDestroy();

            this.vm._ctx.$options.methods = null;
            this.vm._ctx.$options.computed = null;
            // this.vm._ctx = null;
            this.vm = null;
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return component;
    }
}