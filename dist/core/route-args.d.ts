import { RouteInfo } from "./route-info.js";
import "@nivinjoseph/n-ext";
export declare class RouteArgs {
    private readonly _pathArgs;
    private readonly _queryArgs;
    private readonly _routeArgs;
    get pathArgs(): object;
    get queryArgs(): object;
    get routeArgs(): Array<unknown>;
    constructor(pathArgs: object, queryArgs: object, routeArgs: Array<unknown>);
    static create(route: RouteInfo, ctx: Record<string, any>): RouteArgs;
    equals(comparison: RouteArgs): boolean;
    private _createParamsArray;
}
//# sourceMappingURL=route-args.d.ts.map