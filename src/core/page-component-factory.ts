import { PageRegistration } from "./page-registration";
import { RouteArgs } from "./route-args";
import { Scope } from "@nivinjoseph/n-ject";
import { given } from "@nivinjoseph/n-defensive";
import { Utilities } from "./utilities";
import { ApplicationException } from "@nivinjoseph/n-exception";
import * as $ from "jquery";


export class PageComponentFactory
{
    public create(registration: PageRegistration): Object
    {
        given(registration, "registration").ensureHasValue();

        const component: any = (<any>registration.viewModel).options || {};
       
        // component.template = registration.template;
        component.render = registration.render;

        component.inject = ["rootScopeContainer"];
        
        component.data = function ()
        {
            let vueVm = this;
            
            let container: Scope = vueVm.rootScopeContainer;
            if (!container)
                throw new ApplicationException("Could not get rootScopeContainer.");
            container = container.createScope(); // page scope
            let vm = container.resolve<any>(registration.name);
            
            let data = {
                vm: vm,
                pageScopeContainer: container
            };
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
            
            return data;
        };
        
        component.provide = function ()
        {
            return {
                pageScopeContainer: this.pageScopeContainer
            };
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
        
        
        const setDocumentMetadata = () =>
        {
            if (registration.title)
                window.document.title = registration.title;
            
            if (registration.metadata)
            {
                for (const key in registration.metadata)
                {
                    const value: string = (<any>registration.metadata)[key];
                    $(`meta[name="${key}"]`).remove();
                    $("head").append(`<meta name="${key}" content="${value}">`);
                }    
            }    
        };
        
        
        
        /* The Full Navigation Resolution Flow
                Navigation triggered
                Call leave guards in deactivated components
                Call global beforeEach guards
                Call beforeRouteUpdate guards in reused components (2.2+)
                Call beforeEnter in route configs
                Resolve async route components
                Call beforeRouteEnter in activated components
                Call global beforeResolve guards (2.5+)
                Navigation confirmed.
                Call global afterEach hooks.
                DOM updates triggered.
                Call callbacks passed to next in beforeRouteEnter guards with instantiated instances.
         */
        // @ts-ignore
        component.beforeRouteEnter = function (to: any, from: any, next: any)
        {
            // called before the route that renders this component is confirmed.
            // does NOT have access to `this` component instance,
            // because it has not been created yet when this guard is called!
            
            let routeArgs: RouteArgs = null;
            
            try 
            {
                routeArgs = RouteArgs.create(registration.route, to);
            }
            catch (error)
            {
                console.log(error);
                next(false);
                return;
            }
            
            setDocumentMetadata();
            next((vueModel: any) =>
            {
                setDocumentMetadata();
                let vm = vueModel.vm;
                vm.__routeArgs = routeArgs;
                if (vm.onEnter)
                    routeArgs.routeArgs.length > 0 ? vm.onEnter(...routeArgs.routeArgs, ...(registration.resolvedValues ? registration.resolvedValues : [])) : vm.onEnter();
            });
        };
        
        component.beforeRouteUpdate = function (to: any, from: any, next: any)
        {
            // called when the route that renders this component has changed,
            // but this component is reused in the new route.
            // For example, for a route with dynamic params /foo/:id, when we
            // navigate between /foo/1 and /foo/2, the same Foo component instance
            // will be reused, and this hook will be called when that happens.
            // has access to `this` component instance.
            
            let routeArgs: RouteArgs = null;
            try 
            {
                routeArgs = RouteArgs.create(registration.route, to);
            }
            catch (error)
            {
                console.log(error);
                next(false);
                return;
            }
            
            let fromRouteArgs: RouteArgs = null;
            try 
            {
                fromRouteArgs = RouteArgs.create(registration.route, from);
            }
            catch (error) 
            {
                console.log(error);
                fromRouteArgs = new RouteArgs({}, {}, []);
            }

            if (routeArgs.equals(fromRouteArgs))
            {
                setDocumentMetadata();
                next();
                return;
            }   
            
            let vm = this.vm;
            if (vm.onLeave)    
            {
                try 
                {
                    vm.onLeave();
                }
                catch (error)
                {
                    next(false);   
                    return;
                }
            }
            
            vm.__routeArgs = routeArgs;
            if (vm.onEnter)
                routeArgs.routeArgs.length > 0 ? vm.onEnter(...routeArgs.routeArgs, ...(registration.resolvedValues ? registration.resolvedValues : [])) : vm.onEnter();
            
            setDocumentMetadata();
            next();
        };
        // @ts-ignore
        component.beforeRouteLeave = function (to: any, from: any, next: any)
        {
            // called when the route that renders this component is about to
            // be navigated away from.
            // has access to `this` component instance.

            let vm = this.vm;
            if (vm.onLeave)
            {
                try 
                {
                    vm.onLeave();
                }
                catch (error)
                {
                    next(false);
                    return;
                }
            }
            
            next();
        };
        
        return component;
    }
}