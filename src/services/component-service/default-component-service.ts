import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import type { Scope } from "@nivinjoseph/n-ject";
import { inject, ref, type ComponentOptions as VueComponentOptions, type Ref, type UnwrapRef } from "vue";
import type { BaseViewModel } from "../../core/base-view-model.js";
import type { ComponentViewModelClass } from "../../core/component-view-model.js";
import { Utilities } from "../../core/utilities.js";
import { ViewModelRegistration } from "../../core/view-model-registration.js";
import type { ComponentService } from "./component-service.js";
import type { ComponentOptions } from "./component-options.js";


export class DefaultComponentService implements ComponentService
{
    public compile(componentViewModelClass: ComponentViewModelClass<any>, cache?: boolean): ComponentOptions
    {
        given(componentViewModelClass, "componentViewModelClass").ensureHasValue().ensureIsFunction();
        given(cache as boolean, "cache").ensureIsBoolean();

        const registration = new ViewModelRegistration(componentViewModelClass);

        return this.create(registration, !!cache);
    }


    public create(registration: ViewModelRegistration, cache: boolean): ComponentOptions
    {
        given(registration, "registration").ensureHasValue().ensureIsType(ViewModelRegistration);
        given(cache, "cache").ensureHasValue().ensureIsBoolean();

        const component: VueComponentOptions = {
            setup: function <T extends BaseViewModel>(): { nAppVm: Ref<UnwrapRef<T>>; }
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

            beforeCreate: function <T extends BaseViewModel>()
            {
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

                (<any>vm)._ctx = this;
                (<any>vm)._bindings = [];
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
            data: function (vm)
            {
                // console.log("data", vm);
                // don't need this here but exposing it so we can check the properties 
                // when using vue dev tools in the browsers.
                return {
                    vm: vm.nAppVm
                };
            },
            activated: function () 
            {
                // console.log("activated", registration.name);
            },
            deactivated: function () 
            {
                // console.log("deactivated", registration.name);
            }
        };

        if (typeof registration.template === "string")
            component.template = registration.template;
        else
            component.render = registration.template;

        return component;
    }
}