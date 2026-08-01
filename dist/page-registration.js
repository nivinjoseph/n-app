import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { appRouteSymbol } from "./route.js";
import { RouteInfo } from "./route-info.js";
import { ComponentRegistration } from "./view-model-registration.js";
export class PageRegistration extends ComponentRegistration {
    static _registry = new Map();
    static find(viewModel) {
        return PageRegistration._registry.get(viewModel) ?? null;
    }
    _view;
    _route;
    _redirect;
    get view() {
        return this._view;
    }
    // private readonly _title: string | null;
    // private readonly _metadata: ReadonlyArray<MetaDetail>;
    // private readonly _resolvers: ReadonlyArray<any> | null = null;
    // private readonly _pages: ReadonlyArray<Function> | null = null;
    // // private _resolvedValues: ReadonlyArray<any> | null = null;
    get route() {
        return this._route;
    }
    get redirect() {
        return this._redirect;
    }
    // public get title(): string | null {
    //     return this._title;
    // }
    // public get metadata(): ReadonlyArray<MetaDetail> {
    //     return this._metadata;
    // }
    // public get resolvers(): ReadonlyArray<any> | null {
    //     return this._resolvers;
    // }
    // public get pages(): ReadonlyArray<Function> | null {
    //     return this._pages;
    // }
    // public get resolvedValues(): ReadonlyArray<any> | null {
    //     return this._resolvedValues;
    // }
    // public set resolvedValues(value: ReadonlyArray<any> | null) {
    //     this._resolvedValues = value;
    // }
    constructor(
    // biome-ignore lint/suspicious/noExplicitAny: variance-free base for registration
    viewModel, view) {
        super(viewModel);
        given(view, "view").ensureHasValue();
        this._view = view;
        // given(defaultPageTitle as string, "defaultPageTitle").ensureIsString();
        // given(
        //     defaultPageMetas as Array<MetaDetail>,
        //     "defaultPageMetas",
        // ).ensureIsArray();
        const metadata = this.viewModel[Symbol.metadata];
        if (metadata == null || !Object.hasOwn(metadata, appRouteSymbol))
            throw new ApplicationException(`PageViewModel '${this.name}' does not have @route applied.`);
        const routeData = metadata[appRouteSymbol];
        this._route = new RouteInfo(routeData.route);
        this._redirect = routeData.redirect ?? null;
        PageRegistration._registry.set(this.viewModel, this);
        // let title = defaultPageTitle || null;
        // if (Reflect.hasOwnMetadata(titleSymbol, this.viewModel))
        //     title = Reflect.getOwnMetadata(titleSymbol, this.viewModel);
        // this._title = title;
        // const metas: Array<MetaDetail> = defaultPageMetas
        //     ? [...defaultPageMetas]
        //     : [];
        // if (Reflect.hasOwnMetadata(metaSymbol, this.viewModel))
        //     metas.push(...Reflect.getOwnMetadata(metaSymbol, this.viewModel));
        // // this._metadata = metas
        // //     .reduce((acc: any, t) =>
        // //     {
        // //         acc[t.name] = t.content;
        // //         return acc;
        // //     }, {});
        // this._metadata = metas;
        // if (Reflect.hasOwnMetadata(resolveSymbol, this.viewModel))
        //     this._resolvers = Reflect.getOwnMetadata(
        //         resolveSymbol,
        //         this.viewModel,
        //     );
        // if (Reflect.hasOwnMetadata(pagesSymbol, this.viewModel))
        //     this._pages = Reflect.getOwnMetadata(pagesSymbol, this.viewModel);
    }
}
//# sourceMappingURL=page-registration.js.map