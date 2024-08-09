import "@nivinjoseph/n-ext";
import { RouteParam } from "./route-param.js";
export declare class RouteInfo {
    private readonly _routeTemplate;
    private readonly _routeParams;
    private readonly _routeParamsRegistry;
    private readonly _vueRoute;
    private readonly _pathSegments;
    private readonly _routeKey;
    private _hasQuery;
    get route(): string;
    get vueRoute(): string;
    get params(): ReadonlyArray<RouteParam>;
    get pathSegments(): ReadonlyArray<string>;
    get routeKey(): string;
    constructor(routeTemplate: string, isUrlGenerator?: boolean);
    findRouteParam(key: string): RouteParam | null;
    generateUrl(values: object): string;
    private _populateRouteParams;
    private _extractTemplateParams;
    private _generateVueRoute;
    private _populatePathSegments;
    private _generateRouteKey;
}
//# sourceMappingURL=route-info.d.ts.map