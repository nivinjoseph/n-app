import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import type { ClassHierarchy } from "@nivinjoseph/n-util";
import type { ReactNode } from "react";
import type { PageViewModel } from "./page-view-model.js";
import { type AppRouteMetadata, appRouteSymbol } from "./route.js";
import { RouteInfo } from "./route-info.js";
import { ComponentRegistration } from "./view-model-registration.js";

// import { titleSymbol } from "./title.js";
// import { metaSymbol, MetaDetail } from "./meta.js";
// // import { authorizeSymbol } from "./authorize.js";
// import { resolveSymbol } from "./resolve.js";
// import { pagesSymbol } from "./pages.js";

// biome-ignore format: prevent multiple line
// biome-ignore lint/suspicious/noExplicitAny: variance-free base for registry lookup
type PageViewModelCtor = abstract new (...args: Array<any>) => PageViewModel<any>;

export class PageRegistration extends ComponentRegistration {
    private static readonly _registry = new Map<
        PageViewModelCtor,
        PageRegistration
    >();

    public static find(viewModel: PageViewModelCtor): PageRegistration | null {
        return PageRegistration._registry.get(viewModel) ?? null;
    }

    private readonly _view: ReactNode;
    private readonly _route: RouteInfo;
    private readonly _redirect: string | null;

    public get view(): ReactNode {
        return this._view;
    }

    // private readonly _title: string | null;
    // private readonly _metadata: ReadonlyArray<MetaDetail>;
    // private readonly _resolvers: ReadonlyArray<any> | null = null;
    // private readonly _pages: ReadonlyArray<Function> | null = null;

    // // private _resolvedValues: ReadonlyArray<any> | null = null;

    public get route(): RouteInfo {
        return this._route;
    }

    public get redirect(): string | null {
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

    public constructor(
        // biome-ignore lint/suspicious/noExplicitAny: variance-free base for registration
        viewModel: ClassHierarchy<PageViewModel<any>>,
        view: ReactNode,
    ) {
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
            throw new ApplicationException(
                `PageViewModel '${this.name}' does not have @route applied.`,
            );

        const routeData = metadata[appRouteSymbol] as AppRouteMetadata;

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

    // public reload(page: Function): void
    // {
    //     given(page, "page").ensureHasValue().ensureIsFunction();

    //     super.reload(page);

    //     if (!Reflect.hasOwnMetadata(appRouteSymbol, this.viewModel))
    //         throw new ApplicationException(`PageViewModel '${this.name}' does not have @route applied.`);

    //     const routeData = Reflect.getOwnMetadata(appRouteSymbol, this.viewModel);

    //     this._route = new RouteInfo(routeData.route);
    //     this._redirect = routeData.redirect;

    //     let title = this._title || null;
    //     if (Reflect.hasOwnMetadata(titleSymbol, this.viewModel))
    //         title = Reflect.getOwnMetadata(titleSymbol, this.viewModel);

    //     this._title = title;

    //     const metas = this._metadata ? Object.entries(this._metadata).map(t => ({name: t[0], content: t[1]})) : [];
    //     if (Reflect.hasOwnMetadata(metaSymbol, this.viewModel))
    //         metas.push(...Reflect.getOwnMetadata(metaSymbol, this.viewModel));

    //     this._metadata = metas
    //         .reduce((acc: any, t) =>
    //         {
    //             acc[t.name] = t.content;
    //             return acc;
    //         }, {});

    //     if (Reflect.hasOwnMetadata(resolveSymbol, this.viewModel))
    //         this._resolvers = Reflect.getOwnMetadata(resolveSymbol, this.viewModel);
    // }
}
