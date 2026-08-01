import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import type { ComponentInstaller } from "@nivinjoseph/n-ject";
import { Container } from "@nivinjoseph/n-ject";
import { configure } from "mobx";
import { type ReactNode, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
    createBrowserRouter,
    type DataRouter,
    Navigate,
    type RouteObject,
    RouterProvider,
} from "react-router";
import type { ApplicationScript } from "./application-script.js";
import type { ComponentDetails, PageDetails } from "./component.js";
import { discoverComponentViewModels } from "./component-discovery.js";
import { Page } from "./page.js";
import { discoverPageDetails } from "./page-discovery.js";
import { PageRegistration } from "./page-registration.js";
import { PageTreeBuilder } from "./page-tree-builder.js";
import { RootContext, type RootScope } from "./root-context.js";
import { ComponentRegistration } from "./view-model-registration.js";

const ALREADY_BOOTSTRAPPED = "ClientApp is already bootstrapped.";

export class ClientApp {
    private readonly _appElementSelector: string;
    private readonly _container: Container;
    private readonly _pageRegistrations: Array<PageRegistration> = [];
    private readonly _componentRegistrations: Array<ComponentRegistration> = [];
    private _initialRoute: string | null = null;
    private _unknownRoute: string | null = null;
    private _routeErrorFallbackComponent: ReactNode | null = null;
    private _startupScript: ApplicationScript | null = null;
    private _isBootstrapped: boolean = false;
    private _rootScope: RootScope | null = null;

    public get container(): Container {
        return this._container;
    }

    public get rootScope(): RootScope {
        if (this._rootScope == null)
            throw new Error("ClientApp rootScope accessed before bootstrap().");
        return this._rootScope;
    }

    public constructor(appElementSelector: string) {
        given(appElementSelector, "appElementSelector")
            .ensureHasValue()
            .ensureIsString()
            .ensure(
                (t) => t.startsWith("#"),
                "ClientApp appElementSelector must start with '#'",
            );
        this._appElementSelector = appElementSelector;

        this._container = new Container();
    }

    public registerInstaller(installer: ComponentInstaller): this {
        given(installer, "installer").ensureHasValue().ensureIsObject();
        given(this, "this").ensure(
            (t) => !t._isBootstrapped,
            ALREADY_BOOTSTRAPPED,
        );

        this._container.install(installer);
        return this;
    }

    public registerPages(...pages: ReadonlyArray<PageDetails>): this {
        given(pages, "pages")
            .ensureHasValue()
            .ensureIsArray()
            .ensureIsNotEmpty();
        given(this, "this").ensure(
            (t) => !t._isBootstrapped,
            ALREADY_BOOTSTRAPPED,
        );

        this._pageRegistrations.push(
            ...pages.map((t) => new PageRegistration(t.viewModel, t.view)),
        );
        return this;
    }

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
    public discoverPages(
        viewModelModules: Record<string, unknown>,
        viewModules: Record<string, unknown>,
    ): this {
        given(viewModelModules, "viewModelModules")
            .ensureHasValue()
            .ensureIsObject();
        given(viewModules, "viewModules").ensureHasValue().ensureIsObject();
        given(this, "this").ensure(
            (t) => !t._isBootstrapped,
            ALREADY_BOOTSTRAPPED,
        );

        this._pageRegistrations.push(
            ...discoverPageDetails(viewModelModules, viewModules).map(
                (t) => new PageRegistration(t.viewModel, t.view),
            ),
        );
        return this;
    }

    public registerComponents(
        ...components: ReadonlyArray<ComponentDetails>
    ): this {
        given(components, "components")
            .ensureHasValue()
            .ensureIsArray()
            .ensureIsNotEmpty();
        given(this, "this").ensure(
            (t) => !t._isBootstrapped,
            ALREADY_BOOTSTRAPPED,
        );

        this._componentRegistrations.push(
            ...components.map((t) => new ComponentRegistration(t.viewModel)),
        );
        return this;
    }

    /**
     * Registers every ComponentViewModel subclass exported by the modules of an
     * eager `import.meta.glob` record (the glob call must live in app source).
     * An empty record is legal — a fresh app has no components yet.
     * `registerComponents` remains the explicit escape hatch for view models
     * that live outside the app's component glob.
     */
    public discoverComponents(modules: Record<string, unknown>): this {
        given(modules, "modules").ensureHasValue().ensureIsObject();
        given(this, "this").ensure(
            (t) => !t._isBootstrapped,
            ALREADY_BOOTSTRAPPED,
        );

        this._componentRegistrations.push(
            ...discoverComponentViewModels(modules).map(
                (t) => new ComponentRegistration(t),
            ),
        );
        return this;
    }

    public configureInitialRoute(route: string): this {
        given(route, "route").ensureHasValue().ensureIsString();
        given(this, "this").ensure(
            (t) => !t._isBootstrapped,
            ALREADY_BOOTSTRAPPED,
        );

        this._initialRoute = route.trim();
        return this;
    }

    public configureUnknownRoute(route: string): this {
        given(route, "route").ensureHasValue().ensureIsString();
        given(this, "this").ensure(
            (t) => !t._isBootstrapped,
            ALREADY_BOOTSTRAPPED,
        );

        this._unknownRoute = route.trim();
        return this;
    }

    public configureRouteErrorFallbackComponent(element: ReactNode): this {
        given(element, "element").ensureHasValue();
        given(this, "this").ensure(
            (t) => !t._isBootstrapped,
            ALREADY_BOOTSTRAPPED,
        );

        this._routeErrorFallbackComponent = element;
        return this;
    }

    public registerStartupScript(startupScript: ApplicationScript): this {
        given(startupScript, "startupScript")
            .ensureHasValue()
            .ensureIsFunction();
        given(this, "this").ensure(
            (t) => !t._isBootstrapped,
            ALREADY_BOOTSTRAPPED,
        );

        this._startupScript = startupScript;
        return this;
    }

    public async bootstrap(): Promise<void> {
        given(this, "this").ensure(
            (t) => !t._isBootstrapped,
            ALREADY_BOOTSTRAPPED,
        );

        this._configureMobx();
        this._registerViewModels();
        await this._bootstrapContainer();
        await this._configureStartup();
        this._mount();

        this._isBootstrapped = true;
    }

    private _configureStartup(): Promise<void> {
        if (this._startupScript == null) return Promise.resolve();

        if (this._rootScope == null)
            throw new Error("ClientApp: rootScope missing at startup.");

        return this._startupScript(this._rootScope);
    }

    private _configureMobx(): void {
        configure({ enforceActions: "always" });
    }

    private _registerViewModels(): void {
        const routeKeys = new Set<string>();
        for (const reg of this._pageRegistrations) {
            if (routeKeys.has(reg.route.routeKey)) {
                throw new ApplicationException(
                    `Route conflict detected for Page registration with name '${reg.name}'`,
                );
            }
            routeKeys.add(reg.route.routeKey);
            this._container.registerScoped(reg.name, reg.viewModel);
        }

        // if (
        //     this._registrations.some(
        //         (t) => t.route.routeKey === registration.route.routeKey,
        //     )
        // )
        //     throw new ApplicationException(
        //         `Route conflict detected for Page registration with name '${registration.name}'`,
        //     );

        for (const reg of this._componentRegistrations)
            this._container.registerTransient(reg.name, reg.viewModel);
    }

    private async _bootstrapContainer(): Promise<void> {
        await this._container.bootstrap();
        this._rootScope = this._container as unknown as RootScope;
    }

    private _mount(): void {
        const rootElement = document.querySelector(this._appElementSelector);
        if (rootElement === null)
            throw new Error(
                `ClientApp: element '${this._appElementSelector}' not found in document.`,
            );

        if (this._rootScope == null)
            throw new Error("ClientApp: rootScope missing at mount.");

        createRoot(rootElement).render(
            <StrictMode>
                <RootContext.Provider value={this._rootScope}>
                    <RouterProvider router={this._createRouting()} />
                </RootContext.Provider>
            </StrictMode>,
        );
    }

    private _createRouting(): DataRouter {
        const pageTree = this._createPageTree();

        const reactRouterRoutes: Array<RouteObject> = [];

        if (this._initialRoute)
            reactRouterRoutes.push({
                path: "/",
                element: <Navigate to={this._initialRoute} replace />,
            });

        reactRouterRoutes.push(
            ...pageTree.map((t) =>
                t.createReactRouterRoute(this._routeErrorFallbackComponent),
            ),
        );

        if (this._unknownRoute)
            reactRouterRoutes.push({
                path: "*",
                element: <Navigate to={this._unknownRoute} replace />,
            });

        return createBrowserRouter(reactRouterRoutes);
    }

    private _createPageTree(): ReadonlyArray<Page> {
        const root = new Page("/", null);
        const treeBuilder = new PageTreeBuilder(root, this._pageRegistrations);
        return treeBuilder.build();
    }
}
