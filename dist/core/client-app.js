// public
import { createApp, h, resolveComponent } from "vue";
import { ConfigurationManager } from "@nivinjoseph/n-config";
import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import { Container } from "@nivinjoseph/n-ject";
import { DefaultComponentService } from "../services/component-service/default-component-service.js";
import { DefaultDisplayService } from "../services/display-service/default-display-service.js";
import { DefaultDialogService } from "./../services/dialog-service/default-dialog-service.js";
import { DefaultEventAggregator } from "./../services/event-aggregator/default-event-aggregator.js";
import { DefaultNavigationService } from "./../services/navigation-service/default-navigation-service.js";
import { DefaultStorageService } from "./../services/storage-service/default-storage-service.js";
import { ComponentManager } from "./component-manager.js";
import { PageManager } from "./page-manager.js";
import { NFileSelectViewModel } from "../components/n-file-select/n-file-select-view-model.js";
import { NExpandingContainerViewModel } from "../components/n-expanding-container/n-expanding-container-view-model.js";
import { NScrollContainerViewModel } from "../components/n-scroll-container/n-scroll-container-view-model.js";
// public
export class ClientApp {
    _appElementId;
    _rootComponentElement;
    _container;
    _componentManager;
    _pageManager;
    _app;
    _isDialogServiceRegistered = false;
    _errorTrackingConfigurationHandler = null;
    _isBootstrapped = false;
    get container() { return this._container; }
    /**
     *
     * @param appElementId
     * @param rootComponentElement
     *
     * @description Requires dev dependencies
     * Check the dev dependencies in package.json
     */
    constructor(appElementId, rootComponentElement, rootComponentProps) {
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
        this._componentManager.registerComponents(NFileSelectViewModel, NExpandingContainerViewModel, NScrollContainerViewModel);
        this._pageManager = new PageManager(this._container);
        this._app.config.performance = false;
    }
    useInstaller(installer) {
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");
        given(installer, "installer").ensureHasValue();
        this._container.install(installer);
        return this;
    }
    registerDialogService(dialogService) {
        given(dialogService, "dialogService").ensureHasValue().ensureIsObject();
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");
        this._container.registerInstance("DialogService", dialogService);
        this._isDialogServiceRegistered = true;
        return this;
    }
    registerComponents(...componentViewModelClasses) {
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");
        this._componentManager.registerComponents(...componentViewModelClasses);
        return this;
    }
    registerPages(...pageViewModelClasses) {
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");
        this._pageManager.registerPages(...pageViewModelClasses);
        return this;
    }
    useAsInitialRoute(route) {
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");
        given(route, "route").ensureHasValue().ensureIsString();
        this._pageManager.useAsInitialRoute(route);
        return this;
    }
    useAsUnknownRoute(route) {
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");
        given(route, "route").ensureHasValue().ensureIsString();
        this._pageManager.useAsUnknownRoute(route);
        return this;
    }
    usePlugin(plugin, ...options) {
        given(plugin, "plugin").ensureHasValue();
        this._app.use(plugin, options);
        return this;
    }
    useHistoryModeRouting() {
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");
        this._pageManager.useHistoryModeRouting();
        return this;
    }
    configureErrorTracking(handler) {
        given(handler, "handler").ensureHasValue().ensureIsFunction();
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");
        this._errorTrackingConfigurationHandler = handler;
        return this;
    }
    bootstrap() {
        given(this, "this").ensure(t => !t._isBootstrapped, "already bootstrapped");
        this._configureGlobalConfig();
        this._configurePages();
        this._configureErrorTracking();
        this._configureComponents();
        this._configureCoreServices();
        this._configureContainer();
        this._app.provide("rootScopeContainer", this._container);
        this._app.use(this._pageManager.vueRouterInstance);
        this._app.mount(this._appElementId);
        this._isBootstrapped = true;
    }
    retrieveRouterInstance() {
        given(this, "this").ensure(t => t._isBootstrapped, "calling retrieveRouterInstance before calling bootstrap")
            .ensure(t => t._pageManager.hasRegistrations, "calling retrieveRouterInstance with no page registrations");
        return this._pageManager.vueRouterInstance;
    }
    _configureGlobalConfig() {
        if (ConfigurationManager.getConfig("env") === "dev") {
            console.log("Bootstrapping in DEV mode.");
            this._app.config.performance = true;
        }
        else {
            this._app.config.performance = false;
        }
    }
    _configureComponents() {
        this._componentManager.bootstrap();
    }
    _configurePages() {
        this._pageManager.bootstrap();
    }
    _configureErrorTracking() {
        if (this._errorTrackingConfigurationHandler != null)
            this._errorTrackingConfigurationHandler(this._pageManager.vueRouterInstance, this._app);
    }
    _configureCoreServices() {
        this._container
            .registerInstance("EventAggregator", new DefaultEventAggregator())
            .registerInstance("NavigationService", new DefaultNavigationService(this._pageManager.vueRouterInstance))
            .registerInstance("StorageService", new DefaultStorageService())
            .registerInstance("DisplayService", new DefaultDisplayService())
            .registerInstance("ComponentService", new DefaultComponentService());
        if (!this._isDialogServiceRegistered)
            this._container.registerInstance("DialogService", new DefaultDialogService());
    }
    _configureContainer() {
        this._container.bootstrap();
    }
}
//# sourceMappingURL=client-app.js.map