import { type App, type Plugin } from "vue";
import "@nivinjoseph/n-ext";
import { type ComponentInstaller, Container } from "@nivinjoseph/n-ject";
import type { DialogService } from "../services/dialog-service/dialog-service.js";
import type { ComponentViewModelClass } from "./component-view-model.js";
import type { PageViewModelClass } from "./page-view-model.js";
import type { Router } from "vue-router";
export declare class ClientApp {
    private readonly _appElementId;
    private readonly _rootComponentElement;
    private readonly _container;
    private readonly _componentManager;
    private readonly _pageManager;
    private readonly _app;
    private _isDialogServiceRegistered;
    private _errorTrackingConfigurationHandler;
    private _isBootstrapped;
    get container(): Container;
    /**
     *
     * @param appElementId
     * @param rootComponentElement
     *
     * @description Requires dev dependencies
     * Check the dev dependencies in package.json
     */
    constructor(appElementId: string, rootComponentElement: string, rootComponentProps?: object);
    useInstaller(installer: ComponentInstaller): this;
    registerDialogService(dialogService: DialogService): this;
    registerComponents(...componentViewModelClasses: Array<ComponentViewModelClass<any>>): this;
    registerPages(...pageViewModelClasses: Array<PageViewModelClass<any>>): this;
    useAsInitialRoute(route: string): this;
    useAsUnknownRoute(route: string): this;
    usePlugin(plugin: Plugin, ...options: Array<any>): this;
    useHistoryModeRouting(): this;
    configureErrorTracking(handler: AppErrorHandler): this;
    bootstrap(): void;
    retrieveRouterInstance(): object;
    private _configureGlobalConfig;
    private _configureComponents;
    private _configurePages;
    private _configureErrorTracking;
    private _configureCoreServices;
    private _configureContainer;
}
export type AppErrorHandler = (vueRouter: Router, vueApp: App) => void;
//# sourceMappingURL=client-app.d.ts.map