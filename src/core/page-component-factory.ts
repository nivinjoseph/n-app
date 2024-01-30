import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import type { Scope } from "@nivinjoseph/n-ject";
import { inject, provide, ref, type ComponentOptions, type Ref, type UnwrapRef } from "vue";
import { PageRegistration } from "./page-registration.js";
import { PageViewModel } from "./page-view-model.js";
import { RouteArgs } from "./route-args.js";
import { Utilities } from "./utilities.js";
import { ComponentFactory } from "./component-factory.js";


export class PageComponentFactory
{
    public create(registration: PageRegistration): ComponentOptions
    {
        given(registration, "registration").ensureHasValue();

        const setDocumentMetadata = (): void =>
        {
            if (registration.title)
                window.document.title = registration.title;

            registration.metadata.forEach((metadata) =>
            {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                $(`meta[${metadata.$key}="${metadata[metadata.$key]}"]`).remove();

                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                $("head").append(`<meta ${Object.keys(metadata).where(t => t !== "$key").map(t => `${t}="${metadata[t]}"`).join(" ")}>`);
            });
        };

        const component: ComponentOptions = {
            name: registration.name,

            // This might break when updating vue. UPDATE WITH CAUTION!
            setup: function <T extends PageViewModel>(): { nAppVm: Ref<UnwrapRef<T>>; }
            {
                let container: Scope | undefined = inject("rootScopeContainer");
                if (container == null)
                    throw new ApplicationException("Could not get pageScopeContainer or rootScopeContainer.");

                container = registration.persist ? container : container.createScope(); // page scope

                const nAppVm = container.resolve<T>(registration.name);

                provide("pageScopeContainer", container);

                return {
                    nAppVm: ref(nAppVm)
                };
            },

            beforeCreate: function <T extends PageViewModel>()
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

                (<any>vm)._ctx = this;
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
            },

            /* The Full Navigation Resolution Flow
             Navigation triggered.
             Call beforeRouteLeave guards in deactivated components.
             Call global beforeEach guards.
             Call beforeRouteUpdate guards in reused components.
             Call beforeEnter in route configs.
             Resolve async route components.
             Call beforeRouteEnter in activated components.
             Call global beforeResolve guards.
             Navigation is confirmed.
             Call global afterEach hooks.
             DOM updates triggered.
             Call callbacks passed to next in beforeRouteEnter guards with instantiated instances. 
             */
            beforeRouteEnter: function (to, _, next)
            {
                // called before the route that renders this component is confirmed.
                // does NOT have access to `this` component instance,
                // because it has not been created yet when this guard is called!

                const routeArgs: RouteArgs = RouteArgs.create(registration.route, to);
                setDocumentMetadata();

                // The beforeRouteEnter guard does NOT have access to this,
                // because the guard is called before the navigation is confirmed,
                // thus the new entering component has not even been created yet.

                // However, you can access the instance by passing a callback to next.
                // The callback will be called when the navigation is confirmed, 
                // and the component instance will be passed to the callback as the argument
                next((vueVm) =>
                {
                    setDocumentMetadata();

                    const vm = (vueVm as any).nAppVm;

                    vm.__routeArgs = routeArgs;

                    if (vm.onEnter)
                    {
                        if (routeArgs.routeArgs.isNotEmpty)
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                            vm.onEnter(
                                ...routeArgs.routeArgs,
                                ...registration.resolvedValues != null ? registration.resolvedValues : []
                            );
                        else
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                            vm.onEnter();
                    }
                });
            },

            beforeRouteUpdate: function (to, from)
            {
                // called when the route that renders this component has changed, but this component is reused in the new route.
                // For example, given a route with params `/users/:id`, when we navigate between `/users/1` and `/users/2`,
                // the same `UserDetails` component instance will be reused, and this hook will be called when that happens.
                // Because the component is mounted while this happens, the navigation guard has access to `this` component instance.

                const toRouteArgs = RouteArgs.create(registration.route, to);
                const fromRouteArgs = RouteArgs.create(registration.route, from);

                if (toRouteArgs.equals(fromRouteArgs))
                {
                    setDocumentMetadata();
                    return true;
                }

                const vm = this.nAppVm;
                if (vm.onLeave)    
                {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    vm.onLeave();
                }

                vm.__routeArgs = toRouteArgs;

                if (vm.onEnter)
                {
                    if (toRouteArgs.routeArgs.isNotEmpty)
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        vm.onEnter(
                            ...toRouteArgs.routeArgs,
                            ...registration.resolvedValues != null ? registration.resolvedValues : []
                        );
                    else
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        vm.onEnter();
                }

                setDocumentMetadata();

                return true;
            },
            beforeRouteLeave: function (_, __)
            {
                const vm = this.nAppVm;

                if (vm.onLeave)
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    vm.onLeave();

                return true;
            }
        };

        if (typeof registration.template === "string")
            component.template = registration.template;
        else
            component.render = registration.template;

        if (registration.localComponentRegistrations.isNotEmpty)
        {
            const componentFactory = new ComponentFactory();

            const components = registration.localComponentRegistrations
                .reduce<Record<string, ComponentOptions>>((acc, t) =>
                {
                    acc[t.element] = componentFactory.create(t);
                    return acc;
                }, {});

            component.components = components;
        }

        return component;
    }
}