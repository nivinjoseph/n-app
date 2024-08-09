import { RouteInfo } from "./route-info.js";
import { HttpException } from "./http-exception.js";
import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
export class RouteArgs {
    _pathArgs;
    _queryArgs;
    _routeArgs;
    get pathArgs() { return this._pathArgs; }
    get queryArgs() { return this._queryArgs; }
    get routeArgs() { return this._routeArgs; }
    constructor(pathArgs, queryArgs, routeArgs) {
        given(pathArgs, "pathArgs").ensureHasValue().ensureIsObject();
        given(queryArgs, "queryArgs").ensureHasValue().ensureIsObject();
        given(routeArgs, "routeArgs").ensureHasValue().ensureIsArray();
        this._pathArgs = pathArgs;
        this._queryArgs = queryArgs;
        this._routeArgs = routeArgs;
    }
    static create(route, ctx) {
        // console.log("ctx", ctx);
        const queryArgs = Object.assign({}, ctx.query);
        const pathArgs = Object.assign({}, ctx.params);
        const model = {};
        for (const key in queryArgs) {
            const routeParam = route.findRouteParam(key);
            if (routeParam) {
                const parsed = routeParam.parseParam(queryArgs[key]);
                model[routeParam.paramKey] = parsed;
                queryArgs[key] = parsed;
            }
            else {
                const value = queryArgs[key];
                if (value == null || typeof value !== "string" || value.isEmptyOrWhiteSpace() || value.trim().toLowerCase() === "null")
                    queryArgs[key] = null;
            }
        }
        for (const key in pathArgs) {
            const routeParam = route.findRouteParam(key);
            // if (!routeParam)
            //     throw new HttpException(404);
            // instead we just skip it. This is because keys in pathParams will include parent page route pathParams
            if (!routeParam)
                continue;
            const parsed = routeParam.parseParam(pathArgs[key]);
            model[routeParam.paramKey] = parsed;
            pathArgs[key] = parsed;
        }
        const routeArgs = [];
        for (const routeParam of route.params) {
            let value = model[routeParam.paramKey];
            if (value === undefined || value === null) {
                if (!routeParam.isOptional)
                    throw new HttpException(404);
                value = null;
            }
            routeArgs.push(value);
        }
        return new RouteArgs(pathArgs, queryArgs, routeArgs);
    }
    equals(comparison) {
        given(comparison, "comparison").ensureHasValue().ensureIsType(RouteArgs);
        const current = this._createParamsArray(this);
        const compare = this._createParamsArray(comparison);
        return current.equals(compare);
    }
    _createParamsArray(routeArgs) {
        const obj = Object.assign({}, routeArgs._pathArgs, routeArgs._queryArgs);
        const params = new Array();
        for (const key in obj)
            params.push([key, obj.getValue(key)]);
        return params.orderBy(t => t[0]);
    }
}
//# sourceMappingURL=route-args.js.map