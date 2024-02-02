import { RouteInfo } from "./route-info.js";
import { HttpException } from "./http-exception.js";
import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";


export class RouteArgs
{
    private readonly _pathArgs: object;
    private readonly _queryArgs: object;
    private readonly _routeArgs: Array<unknown>;
    
    
    public get pathArgs(): object { return this._pathArgs; }
    public get queryArgs(): object { return this._queryArgs; }
    public get routeArgs(): Array<unknown> { return this._routeArgs; }
    
    
    public constructor(pathArgs: object, queryArgs: object, routeArgs: Array<unknown>)
    {
        given(pathArgs, "pathArgs").ensureHasValue().ensureIsObject();
        given(queryArgs, "queryArgs").ensureHasValue().ensureIsObject();
        given(routeArgs, "routeArgs").ensureHasValue().ensureIsArray();
        
        this._pathArgs = pathArgs;
        this._queryArgs = queryArgs;
        this._routeArgs = routeArgs;
    }
    
    public static create(route: RouteInfo, ctx: Record<string, any>): RouteArgs
    {
        // console.log("ctx", ctx);

        const queryArgs = Object.assign({}, ctx.query);
        const pathArgs = Object.assign({}, ctx.params);
        const model: Record<string, any> = {};

        for (const key in queryArgs)
        {
            const routeParam = route.findRouteParam(key);
            if (routeParam)
            {
                const parsed = routeParam.parseParam(queryArgs[key]);
                model[routeParam.paramKey] = parsed;
                queryArgs[key] = parsed;
            }
            else
            {
                const value: string | null = queryArgs[key];
                if (value == null || typeof value !== "string" || value.isEmptyOrWhiteSpace() || value.trim().toLowerCase() === "null")
                    queryArgs[key] = null;
            }
        }

        for (const key in pathArgs)
        {
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
        for (const routeParam of route.params)
        {
            let value = model[routeParam.paramKey];
            if (value === undefined || value === null)
            {
                if (!routeParam.isOptional)
                    throw new HttpException(404);

                value = null;
            }
            routeArgs.push(value);
        }

        return new RouteArgs(pathArgs, queryArgs, routeArgs);
    }
    
    public equals(comparison: RouteArgs): boolean
    {
        given(comparison, "comparison").ensureHasValue().ensureIsType(RouteArgs);
        
        const current = this._createParamsArray(this);
        const compare = this._createParamsArray(comparison);
        
        return current.equals(compare);
    }
    
    
    private _createParamsArray(routeArgs: RouteArgs): Array<[string, any]>
    {
        const obj: Object = Object.assign({}, routeArgs._pathArgs, routeArgs._queryArgs);
        const params = new Array<[string, any]>();
        for (const key in obj)
            params.push([key, obj.getValue(key)]);
        return params.orderBy(t => t[0]);
    }
}