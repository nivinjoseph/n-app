import type { ComponentInstaller } from "@nivinjoseph/n-ject";
import { Container } from "@nivinjoseph/n-ject";
import { type ReactNode } from "react";
import type { ApplicationScript } from "./application-script.js";
import type { ComponentDetails, PageDetails } from "./component.js";
import { type RootScope } from "./root-context.js";
export declare class ClientApp {
    private readonly _appElementSelector;
    private readonly _container;
    private readonly _pageRegistrations;
    private readonly _componentRegistrations;
    private _initialRoute;
    private _unknownRoute;
    private _routeErrorFallbackComponent;
    private _startupScript;
    private _isBootstrapped;
    private _rootScope;
    get container(): Container;
    get rootScope(): RootScope;
    constructor(appElementSelector: string);
    registerInstaller(installer: ComponentInstaller): this;
    registerPages(...pages: ReadonlyArray<PageDetails>): this;
    /**
     * Registers every page found by pairing two eager `import.meta.glob`
     * records: the page view-model modules and the page view modules (the glob
     * calls must live in app source). Views are paired by convention —
     * `<name>-view-model.ts` -> sibling `<name>.tsx`, export named after the
     * VM class minus the `ViewModel` suffix. Empty records are legal (a
     * zero-page app then fails at bootstrap when the page tree is built).
     * `registerPages` remains the explicit escape hatch for pages that live
     * outside the app's page globs.
     */
    discoverPages(viewModelModules: Record<string, unknown>, viewModules: Record<string, unknown>): this;
    registerComponents(...components: ReadonlyArray<ComponentDetails>): this;
    /**
     * Registers every ComponentViewModel subclass exported by the modules of an
     * eager `import.meta.glob` record (the glob call must live in app source).
     * An empty record is legal — a fresh app has no components yet.
     * `registerComponents` remains the explicit escape hatch for view models
     * that live outside the app's component glob.
     */
    discoverComponents(modules: Record<string, unknown>): this;
    configureInitialRoute(route: string): this;
    configureUnknownRoute(route: string): this;
    configureRouteErrorFallbackComponent(element: ReactNode): this;
    registerStartupScript(startupScript: ApplicationScript): this;
    bootstrap(): Promise<void>;
    private _configureStartup;
    private _configureMobx;
    private _registerViewModels;
    private _bootstrapContainer;
    private _mount;
    private _createRouting;
    private _createPageTree;
}
//# sourceMappingURL=client-app.d.ts.map