import { Container } from "@nivinjoseph/n-ject";
import { type Router } from "vue-router";
import type { PageViewModelClass } from "./page-view-model.js";
export declare class PageManager {
    private readonly _container;
    private readonly _pageViewModelClasses;
    private readonly _registrations;
    private readonly _resolvers;
    private _vueRouterInstance;
    private _initialRoute;
    private _unknownRoute;
    private _useHistoryMode;
    get hasRegistrations(): boolean;
    get useHistoryMode(): boolean;
    get vueRouterInstance(): Router;
    constructor(container: Container);
    registerPages(...pageViewModelClasses: Array<PageViewModelClass<any>>): void;
    useAsInitialRoute(route: string): void;
    useAsUnknownRoute(route: string): void;
    useHistoryModeRouting(): void;
    bootstrap(): void;
    private _registerPage;
    private _createRouting;
    private _createPageTree;
    private _configureResolves;
    private _registerLocalComponentViewModel;
}
//# sourceMappingURL=page-manager.d.ts.map