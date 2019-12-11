import { Container } from "@nivinjoseph/n-ject";
export declare class PageManager {
    private readonly _vueRouter;
    private readonly _container;
    private readonly _pageViewModelClasses;
    private readonly _registrations;
    private readonly _resolvers;
    private _vueRouterInstance;
    private _initialRoute;
    private _unknownRoute;
    private _defaultPageTitle;
    private _defaultPageMetas;
    private _useHistoryMode;
    get useHistoryMode(): boolean;
    get vueRouterInstance(): any;
    constructor(vueRouter: any, container: Container);
    registerPages(...pageViewModelClasses: Function[]): void;
    useAsInitialRoute(route: string): void;
    useAsUnknownRoute(route: string): void;
    useAsDefaultPageTitle(title: string): void;
    useAsDefaultPageMetadata(metas: ReadonlyArray<{
        name: string;
        content: string;
    }>): void;
    useHistoryModeRouting(): void;
    bootstrap(): void;
    private registerPage;
    private createRouting;
    private createPageTree;
    private configureResolves;
}
