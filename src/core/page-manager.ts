import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { Container } from "@nivinjoseph/n-ject";
import { createRouter, createWebHashHistory, createWebHistory, type Router } from "vue-router";
import { PageRegistration } from "./page-registration.js";
import { PageTreeBuilder } from "./page-tree-builder.js";
import type { PageViewModelClass } from "./page-view-model.js";
import { Page } from "./page.js";
import type { Resolver } from "./resolve.js";
import type { ComponentRegistration } from "./component-registration.js";


export class PageManager
{
    private readonly _container: Container;
    private readonly _pageViewModelClasses = new Array<PageViewModelClass<any>>();
    private readonly _registrations = new Array<PageRegistration>();
    private readonly _resolvers = new Array<string>();
    private _vueRouterInstance: Router | null = null;
    private _initialRoute: string | null = null;
    private _unknownRoute: string | null = null;
    private _useHistoryMode = false;


    public get hasRegistrations(): boolean { return this._registrations.isNotEmpty; }
    public get useHistoryMode(): boolean { return this._useHistoryMode; }
    public get vueRouterInstance(): Router
    {
        given(this, "this").ensure(t => t._vueRouterInstance != null, "not bootstrapped");
        return this._vueRouterInstance!;
    }


    public constructor(container: Container)
    {

        given(container, "container").ensureHasValue().ensureIsObject();
        this._container = container;
    }


    public registerPages(...pageViewModelClasses: Array<PageViewModelClass<any>>): void
    {
        this._pageViewModelClasses.push(...pageViewModelClasses);
    }

    public useAsInitialRoute(route: string): void
    {
        given(route, "route").ensureHasValue().ensureIsString();
        this._initialRoute = route.trim();
    }

    public useAsUnknownRoute(route: string): void
    {
        given(route, "route").ensureHasValue().ensureIsString();
        this._unknownRoute = route.trim();
    }

    public useHistoryModeRouting(): void
    {
        this._useHistoryMode = true;
    }

    public bootstrap(): void
    {
        this._pageViewModelClasses.forEach(t => this._registerPage(t));
        if (this._registrations.length === 0)
            return;

        this._createRouting();
        this._configureResolves();
    }


    private _registerPage(pageViewModelClass: PageViewModelClass<any>): void
    {
        const registration = new PageRegistration(pageViewModelClass, null, null);

        if (this._registrations.some(t => t.name === registration.name))
            throw new ApplicationException(`Duplicate Page registration with name '${registration.name}'.`);

        if (this._registrations.some(t => t.route.routeKey === registration.route.routeKey))
            throw new ApplicationException(`Route conflict detected for Page registration with name '${registration.name}'`);

        this._registrations.push(registration);

        if (registration.persist)
            this._container.registerSingleton(registration.name, registration.viewModel);
        else
            this._container.registerTransient(registration.name, registration.viewModel);

        if (registration.resolvers && registration.resolvers.isNotEmpty)
            registration.resolvers.forEach(t =>
            {
                if (this._resolvers.contains(t.name))
                    return;

                this._container.registerTransient(t.name, t.value);
                this._resolvers.push(t.name);
            });

        if (registration.localComponentRegistrations.isNotEmpty)
        {
            registration.localComponentRegistrations
                .forEach(t => this._registerLocalComponentViewModel(t));
        }

        if (registration.pages && registration.pages.isNotEmpty)
            registration.pages.forEach(t => this._registerPage(t));
    }

    private _createRouting(): void
    {
        const pageTree = this._createPageTree();
        const vueRouterRoutes = pageTree.map(t => t.createVueRouterRoute());
        if (this._initialRoute)
            vueRouterRoutes.push({ path: "/", redirect: this._initialRoute });
        if (this._unknownRoute)
            vueRouterRoutes.push({ path: "/:unknown(.*)", redirect: this._unknownRoute });

        const routeHistory = this._useHistoryMode ? createWebHistory() : createWebHashHistory();

        this._vueRouterInstance = createRouter({
            history: routeHistory,
            routes: vueRouterRoutes,
            scrollBehavior: function (_, __, ___)
            {
                return {
                    top: 0,
                    left: 0
                };
            }
        });
    }

    private _createPageTree(): ReadonlyArray<Page>
    {
        const root = new Page("/", null);
        const treeBuilder = new PageTreeBuilder(root, this._registrations);
        return treeBuilder.build();
    }

    private _configureResolves(): void
    {
        this._vueRouterInstance!.beforeEach(async (to, from) =>
        {
            const registrationName = to.name!.toString();
            const registration = this._registrations.find(t => t.name === registrationName);
            if (registration == null)
                throw new ApplicationException(`Unable to find PageRegistration with name '${registrationName}'`);
            registration.resolvedValues = null;

            if (registration.resolvers && registration.resolvers.length > 0)
            {
                const resolvers = registration.resolvers.map(t => this._container.resolve<Resolver>(t.name));
                const resolutions = await resolvers
                    .mapAsync(t =>
                    {
                        // don't need to catch this error adn return false
                        // now if an error is thrown then it will cancel the navigation.
                        // also the error will be reported to the router, 
                        // which can be caught and logged from the global handler and won't be swallowed 
                        return t.resolve(from, to);
                        //     try 
                        //     {
                        //         const resolution = await t.resolve(from, to);
                        //         return resolution;
                        //     }
                        //     catch (error)
                        //     {
                        //         return false;
                        //     }
                    });

                const redirectResolution = resolutions.find(t => !!t.redirect);
                if (redirectResolution != null && redirectResolution.redirect != null)
                    return {
                        path: redirectResolution.redirect
                    };

                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                registration.resolvedValues = resolutions.where(t => t.value != null).map(t => t.value);
            }

            return true;
        });
    }

    private _registerLocalComponentViewModel(registration: ComponentRegistration): void
    {
        if (registration.persist)
            this._container.registerSingleton(registration.name, registration.viewModel);
        else
            this._container.registerTransient(registration.name, registration.viewModel);

        // registering local components
        if (registration.localComponentRegistrations.isNotEmpty)
            registration.localComponentRegistrations
                .forEach(t => this._registerLocalComponentViewModel(t));
    }
}

