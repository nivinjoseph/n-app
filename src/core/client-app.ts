// import Vue from "@nivinjoseph/vue";
// const Vue = require("vue");

// public
import { createApp, type App, h, resolveComponent, type Plugin } from "vue";

import { ConfigurationManager } from "@nivinjoseph/n-config";
import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import { type ComponentInstaller, Container } from "@nivinjoseph/n-ject";
import { DefaultComponentService } from "../services/component-service/default-component-service.js";
import { DefaultDisplayService } from "../services/display-service/default-display-service.js";
import { DefaultDialogService } from "./../services/dialog-service/default-dialog-service.js";
import { DefaultEventAggregator } from "./../services/event-aggregator/default-event-aggregator.js";
import { DefaultNavigationService } from "./../services/navigation-service/default-navigation-service.js";
import { DefaultStorageService } from "./../services/storage-service/default-storage-service.js";
import { ComponentManager } from "./component-manager.js";
import { PageManager } from "./page-manager.js";
import type { DialogService } from "../services/dialog-service/dialog-service.js";
import type { ComponentViewModelClass } from "./component-view-model.js";
import type { PageViewModelClass } from "./page-view-model.js";
import type { Router } from "vue-router";
import { NFileSelectViewModel } from "../components/n-file-select/n-file-select-view-model.js";
import { NExpandingContainerViewModel } from "../components/n-expanding-container/n-expanding-container-view-model.js";
import { NScrollContainerViewModel } from "../components/n-scroll-container/n-scroll-container-view-model.js";


// public
export class ClientApp
{
    private readonly _appElementId: string;
    private readonly _rootComponentElement: string;
    private readonly _container: Container;
    private readonly _componentManager: ComponentManager;
    private readonly _pageManager: PageManager;
    private readonly _app: App;
    private _isDialogServiceRegistered = false;
    private _errorTrackingConfigurationCallback: ((vueRouter: Router) => void) | null = null;
    private _isBootstrapped = false;


    public get container(): Container { return this._container; }


    /**
     * 
     * @param appElementId 
     * @param rootComponentElement 
     * 
     * @description Requires dev dependencies
     * Check the dev dependencies in package.json
     */

    public constructor(appElementId: string, rootComponentElement: string, rootComponentProps?: object)
    {
        given(appElementId, "appElementId").ensureHasValue().ensureIsString().ensure(t => t.startsWith("#"));
        this._appElementId = appElementId;

        given(rootComponentElement, "rootComponentElement").ensureHasValue().ensureIsString();
        this._rootComponentElement = rootComponentElement;

        given(rootComponentProps, "rootComponentProps").ensureIsObject();

        this._container = new Container();

        this._app = createApp({
            render: () => h(resolveComponent(this._rootComponentElement), rootComponentProps)
        });

        this._componentManager = new ComponentManager(this._app, this._container);

        this._componentManager.registerComponents(
            NFileSelectViewModel, NExpandingContainerViewModel, NScrollContainerViewModel
        );
        this._pageManager = new PageManager(this._container, this._componentManager);

        this._app.config.performance = false;
        // Vue.config.silent = false;
        // Vue.config.devtools = false;
        // Vue.config.performance = false;
        // Vue.config.productionTip = false;
    }


    public useInstaller(installer: ComponentInstaller): this
    {
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");

        given(installer, "installer").ensureHasValue();

        this._container.install(installer);
        return this;
    }

    public registerDialogService(dialogService: DialogService): this
    {
        given(dialogService, "dialogService").ensureHasValue().ensureIsObject();

        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");

        this._container.registerInstance("DialogService", dialogService);
        this._isDialogServiceRegistered = true;

        return this;
    }

    public registerComponents(...componentViewModelClasses: Array<ComponentViewModelClass<any>>): this
    {
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");

        this._componentManager.registerComponents(...componentViewModelClasses);
        return this;
    }

    public registerPages(...pageViewModelClasses: Array<PageViewModelClass<any>>): this
    {
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");

        this._pageManager.registerPages(...pageViewModelClasses);
        return this;
    }

    public useAsInitialRoute(route: string): this
    {
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");

        given(route, "route").ensureHasValue().ensureIsString();
        this._pageManager.useAsInitialRoute(route);
        return this;
    }

    public useAsUnknownRoute(route: string): this
    {
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");

        given(route, "route").ensureHasValue().ensureIsString();
        this._pageManager.useAsUnknownRoute(route);
        return this;
    }

    public usePlugin(plugin: Plugin, ...options: Array<any>): this
    {
        given(plugin, "plugin").ensureHasValue();

        this._app.use(plugin, options);

        return this;
    }

    // /**
    //  * @deprecated
    //  */
    // public useAsDefaultPageTitle(title: string): this
    // {
    //     if (this._isBootstrapped)
    //         throw new InvalidOperationException("useAsDefaultPageTitle");

    //     given(title, "title").ensureHasValue().ensureIsString();
    //     this._pageManager.useAsDefaultPageTitle(title);
    //     return this;
    // }

    // /**
    //  * @deprecated
    //  */
    // public useAsDefaultPageMetadata(...metas: Array<{ name: string; content: string; }>): this
    // {
    //     if (this._isBootstrapped)
    //         throw new InvalidOperationException("useAsDefaultPageMetadata");

    //     given(metas, "metas").ensureHasValue().ensureIsArray().ensure(t => t.length > 0);
    //     this._pageManager.useAsDefaultPageMetadata(metas);
    //     return this;
    // }

    public useHistoryModeRouting(): this
    {
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");

        // if (this._initialRoute)
        //     throw new InvalidOperationException("Cannot use history mode with initial route.");

        this._pageManager.useHistoryModeRouting();
        return this;
    }

    // public enableDevMode(): this
    // {
    //     if (this._isbootstrapped)
    //         throw new InvalidOperationException("enableDevMode");

    //     Config.enableDev(Vue);
    //     return this;
    // }

    public configureErrorTracking(callback: (vueRouter: any) => void): this
    {
        given(callback, "callback").ensureHasValue().ensureIsFunction();

        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");

        this._errorTrackingConfigurationCallback = callback;
        return this;
    }

    public bootstrap(): void
    {
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");

        // this._app = createApp()

        this._configureGlobalConfig();
        this._configurePages();
        this._configureErrorTracking();
        this._configureComponents();
        this._configureCoreServices();
        this._configureContainer();

        this._app.provide("rootScopeContainer", this._container);
        this._app.use(this._pageManager.vueRouterInstance);

        this._app.mount(this._appElementId);


        // this._configureRoot();

        this._isBootstrapped = true;
        // this._pageManager.handleInitialRoute();
    }

    public retrieveRouterInstance(): object
    {
        given(this, "this").ensure(t => t._isBootstrapped, "calling retrieveRouterInstance before calling bootstrap")
            .ensure(t => t._pageManager.hasRegistrations, "calling retrieveRouterInstance with no page registrations");

        return this._pageManager.vueRouterInstance;
    }


    private _configureGlobalConfig(): void
    {
        if (ConfigurationManager.getConfig("env") === "dev")
        {
            console.log("Bootstrapping in DEV mode.");

            // Vue.config.silent = false;
            // Vue.config.devtools = true;
            // Vue.config.performance = true;
            // Vue.config.productionTip = true;
            this._app.config.performance = true;
        }
        else
        {
            // Vue.config.silent = true;
            // Vue.config.devtools = false;
            // Vue.config.performance = false;
            // Vue.config.productionTip = false;
            this._app.config.performance = false;
        }

        // console.log(`Bootstrapping in ${ConfigurationManager.getConfig("env")} mode.`);

        // Vue.config.silent = false;
        // Vue.config.devtools = true;
        // Vue.config.performance = true;
        // Vue.config.productionTip = true;
    }


    private _configureComponents(): void
    {
        this._componentManager.bootstrap();
    }

    private _configurePages(): void
    {
        this._pageManager.bootstrap();
    }

    private _configureErrorTracking(): void
    {
        if (this._errorTrackingConfigurationCallback != null)
            this._errorTrackingConfigurationCallback(this._pageManager.vueRouterInstance);
    }

    private _configureCoreServices(): void
    {
        this._container
            .registerInstance("EventAggregator", new DefaultEventAggregator())
            .registerInstance("NavigationService", new DefaultNavigationService(this._pageManager.vueRouterInstance))
            .registerInstance("StorageService", new DefaultStorageService())
            .registerInstance("DisplayService", new DefaultDisplayService())
            .registerInstance("ComponentService", new DefaultComponentService())
            ;

        if (!this._isDialogServiceRegistered)
            this._container.registerInstance("DialogService", new DefaultDialogService());
    }

    private _configureContainer(): void
    {
        this._container.bootstrap();
    }
}