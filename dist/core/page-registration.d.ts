import { type MetaDetail } from "./meta.js";
import { RouteInfo } from "./route-info.js";
import { ViewModelRegistration } from "./view-model-registration.js";
import type { PageViewModelClass } from "./page-view-model.js";
import { type ResolveDecoratorMetadata } from "./resolve.js";
import { ComponentRegistration } from "./component-registration.js";
export declare class PageRegistration extends ViewModelRegistration {
    private readonly _route;
    private readonly _redirect;
    private readonly _title;
    private readonly _metadata;
    private readonly _resolvers;
    private readonly _pages;
    private readonly _localComponentRegistrations;
    private _resolvedValues;
    get route(): RouteInfo;
    get redirect(): string | null;
    get title(): string | null;
    get metadata(): ReadonlyArray<MetaDetail>;
    get resolvers(): ReadonlyArray<ResolveDecoratorMetadata> | null;
    get pages(): ReadonlyArray<PageViewModelClass<any>> | null;
    get localComponentRegistrations(): Array<ComponentRegistration>;
    get resolvedValues(): ReadonlyArray<any> | null;
    set resolvedValues(value: ReadonlyArray<any> | null);
    constructor(page: PageViewModelClass<any>, defaultPageTitle: string | null, defaultPageMetas: ReadonlyArray<MetaDetail> | null);
}
//# sourceMappingURL=page-registration.d.ts.map