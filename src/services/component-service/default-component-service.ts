import { given } from "@nivinjoseph/n-defensive";
import { ComponentService } from "./component-service";
import { ViewModelRegistration } from "../../core/view-model-registration";
import { Scope } from "@nivinjoseph/n-ject";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { Utilities } from "../../core/utilities";
import { ComponentOptions } from "./component-options";


export class DefaultComponentService implements ComponentService
{
    public compile(componentViewModelClass: Function, cache?: boolean): ComponentOptions
    {
        given(componentViewModelClass, "componentViewModelClass").ensureHasValue().ensureIsFunction();
        given(cache, "cache").ensureIsBoolean();

        const registration = new ViewModelRegistration(componentViewModelClass);

        return this.create(registration, !!cache);
    }


    public create(registration: ViewModelRegistration, cache: boolean): ComponentOptions
    {
        given(registration, "registration").ensureHasValue().ensureIsType(ViewModelRegistration);
        given(cache, "cache").ensureHasValue().ensureIsBoolean();

        const component: any = (<any>registration.viewModel).options || {};
        component._cache = cache;

        // component.template = registration.template;
        component.render = registration.render;

        component.inject = ["pageScopeContainer", "rootScopeContainer"];

        component.data = function ()
        {
            let vueVm = this;

            const container: Scope = vueVm.pageScopeContainer || vueVm.rootScopeContainer;
            if (!container)
                throw new ApplicationException("Could not get pageScopeContainer or rootScopeContainer.");
            
            let vm: any = null;
            if (component._cache)
            {
                if (component._cachedVm)
                    vm = component._cachedVm;
                else
                    vm = component._cachedVm = container.resolve<any>(registration.name);
            }
            else
            {
                vm = container.resolve<any>(registration.name);
            }

            let data = { vm: vm };
            let methods: { [index: string]: any } = {};
            let computed: { [index: string]: any } = {};

            let propertyInfos = Utilities.getPropertyInfos(vm);
            for (let info of propertyInfos)
            { 
                if (typeof (info.descriptor.value) === "function")
                    methods[info.name] = info.descriptor.value.bind(vm);
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
            vm._bindings = [];

            return data;
        };


        component.beforeCreate = function ()
        {
            // console.log("executing beforeCreate");
            // console.log(this.vm);
        };

        component.created = function ()
        {
            // console.log("executing created");
            // console.log(this.vm);

            if (this.vm.onCreate)
                this.vm.onCreate();
        };

        component.beforeMount = function ()
        {
            // console.log("executing beforeMount");
            // console.log(this.vm);
        };

        component.mounted = function ()
        {
            // console.log("executing mounted");
            // console.log(this.vm);

            if (this.vm.onMount)
                this.vm.onMount(this.$el);
        };

        component.beforeUpdate = function ()
        {
            // console.log("executing beforeUpdate");
            // console.log(this.vm);
        };

        component.updated = function ()
        {
            // console.log("executing updated");
            // console.log(this.vm);
        };

        component.beforeDestroy = function ()
        {
            // console.log("executing beforeDestroy");
            // console.log(this.vm);
        };

        component.destroyed = function ()
        {
            // console.log("executing destroyed");
            // console.log(this.vm);

            if (this.vm.onDestroy)
                this.vm.onDestroy();
        };

        return component;
    }
}