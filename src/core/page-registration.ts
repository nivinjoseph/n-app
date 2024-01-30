import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { metaSymbol, type MetaDetail } from "./meta.js";
import { RouteInfo } from "./route-info.js";
import { appRouteSymbol, type RouteDecoratorMetadata } from "./route.js";
import { titleSymbol } from "./title.js";
import { ViewModelRegistration } from "./view-model-registration.js";
// import { authorizeSymbol } from "./authorize";
import type { PageViewModelClass } from "./page-view-model.js";
import { pagesSymbol } from "./pages.js";
import { resolveSymbol, type ResolveDecoratorMetadata } from "./resolve.js";
import { ComponentRegistration } from "./component-registration.js";
import type { ComponentViewModelClass } from "./component-view-model.js";
import { componentsSymbol } from "./components.js";


export class PageRegistration extends ViewModelRegistration
{
    private readonly _route: RouteInfo;
    private readonly _redirect: string | null;
    private readonly _title: string | null;
    private readonly _metadata: ReadonlyArray<MetaDetail>;
    private readonly _resolvers: ReadonlyArray<ResolveDecoratorMetadata> | null = null;
    private readonly _pages: ReadonlyArray<PageViewModelClass<any>> | null = null;
    private readonly _localComponentRegistrations = new Array<ComponentRegistration>();

    private _resolvedValues: ReadonlyArray<any> | null = null;


    public get route(): RouteInfo { return this._route; }
    public get redirect(): string | null { return this._redirect; }
    public get title(): string | null { return this._title; }
    public get metadata(): ReadonlyArray<MetaDetail> { return this._metadata; }
    public get resolvers(): ReadonlyArray<ResolveDecoratorMetadata> | null { return this._resolvers; }
    public get pages(): ReadonlyArray<PageViewModelClass<any>> | null { return this._pages; }
    public get localComponentRegistrations(): Array<ComponentRegistration> { return this._localComponentRegistrations; }
    

    public get resolvedValues(): ReadonlyArray<any> | null { return this._resolvedValues; }
    public set resolvedValues(value: ReadonlyArray<any> | null) { this._resolvedValues = value; }


    public constructor(page: PageViewModelClass<any>, defaultPageTitle: string | null, defaultPageMetas: ReadonlyArray<MetaDetail> | null)
    {
        given(page, "page").ensureHasValue().ensureIsFunction();
        given(defaultPageTitle, "defaultPageTitle").ensureIsString();
        given(defaultPageMetas, "defaultPageMetas").ensureIsArray();

        super(page);

        const metadata = page[Symbol.metadata]!;

        const routeData = metadata[appRouteSymbol] as RouteDecoratorMetadata | undefined;
        if (routeData == null)
            throw new ApplicationException(`PageViewModel '${this.name}' does not have @route applied.`);

        this._route = new RouteInfo(routeData.route);
        this._redirect = routeData.redirect ?? null;

        let title = metadata[titleSymbol] as string | undefined;
        if (title == null)
            title = defaultPageTitle ?? undefined;

        this._title = title ?? null;

        const allMeta: Array<MetaDetail> = defaultPageMetas ? [...defaultPageMetas] : [];

        const metas = metadata[metaSymbol] as ReadonlyArray<MetaDetail> | undefined;
        if (metas != null)
            allMeta.push(...metas);

        this._metadata = allMeta;

        const resolvers = metadata[resolveSymbol] as ReadonlyArray<ResolveDecoratorMetadata> | undefined;
        if (resolvers != null)
            this._resolvers = resolvers;

        const pages = metadata[pagesSymbol] as ReadonlyArray<PageViewModelClass<any>> | undefined;
        if (pages != null)
            this._pages = pages;
        
        const components = metadata[componentsSymbol] as ReadonlyArray<ComponentViewModelClass<any>> | undefined;
        if (components != null && components.isNotEmpty)
        {
            components.forEach(component =>
            {
                const registration = new ComponentRegistration(component);

                if (this._localComponentRegistrations.some(t => t.name === registration.name))
                    throw new ApplicationException(`Duplicate Local Component registration with name '${registration.name}' for Page '${this.name}'.`);

                if (this._localComponentRegistrations.some(t => t.element === registration.element))
                    throw new ApplicationException(`Duplicate Local Component registration with element '${registration.element}' for Page '${this.name}'`);

                this._localComponentRegistrations.push(registration);
            });
        }
    }
}