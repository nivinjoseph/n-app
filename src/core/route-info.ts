import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import { ApplicationException, ArgumentException } from "@nivinjoseph/n-exception";
import { RouteParam } from "./route-param.js";

// route template format: /api/Product/{id:number}?{name?:string}&{all:boolean}

export class RouteInfo
{
    private readonly _routeTemplate: string;
    private readonly _routeParams = new Array<RouteParam>();
    private readonly _routeParamsRegistry: Record<string, RouteParam | null> = {};
    private readonly _vueRoute: string | null = null;
    private readonly _pathSegments = new Array<string>();
    private readonly _routeKey: string | null = null;
    private _hasQuery = false;


    public get route(): string { return this._routeTemplate; }
    public get vueRoute(): string
    {
        given(this, "this").ensure(t => t._vueRoute != null, "not available in UrlGenerator mode");
        return this._vueRoute!;
    }
    public get params(): ReadonlyArray<RouteParam> { return this._routeParams; }
    public get pathSegments(): ReadonlyArray<string> { return this._pathSegments; }
    public get routeKey(): string
    {
        given(this, "this").ensure(t => t._routeKey != null, "not available in UrlGenerator mode");
        return this._routeKey!;
    }


    public constructor(routeTemplate: string, isUrlGenerator = false) // true if used purely for url generation (only by utils)
    {
        given(routeTemplate, "routeTemplate")
            .ensureHasValue()
            .ensure(t => !t.isEmptyOrWhiteSpace());

        routeTemplate = routeTemplate.trim().replaceAll(" ", "");

        if (!isUrlGenerator)
        {
            given(routeTemplate, "routeTemplate")
                .ensure(t => t.startsWith("/"), "has to start with '/'")
                .ensure(t => !t.contains("//"), "cannot contain '//'");

            if (routeTemplate.length > 1 && routeTemplate.endsWith("/"))
                routeTemplate = routeTemplate.substr(0, routeTemplate.length - 1);
        }

        this._routeTemplate = routeTemplate;
        this._populateRouteParams();

        if (!isUrlGenerator)
        {
            this._vueRoute = this._generateVueRoute(this._routeTemplate);
            this._populatePathSegments();
            this._routeKey = this._generateRouteKey();
        }
    }


    public findRouteParam(key: string): RouteParam | null
    {
        given(key, "key").ensureHasValue().ensureIsString();
        return this._routeParamsRegistry[key.trim().toLowerCase()];
    }

    public generateUrl(values: object): string
    {
        given(values, "values").ensureHasValue().ensureIsObject();

        let url = this._routeTemplate;
        let hasQuery = this._hasQuery;

        for (const key in values)
        {
            const routeParam = this.findRouteParam(key);
            const val = values.getValue(key);

            if (routeParam)
            {
                const param = "{" + routeParam.param + "}";
                let replacement = routeParam.isQuery
                    ? "{0}={1}".format(key, encodeURIComponent(val))
                    : encodeURIComponent(val);
                if (val == null && routeParam.isQuery && routeParam.isOptional) // only query params can be optional anyway
                    replacement = "";

                url = url.replace(param, replacement);
            }
            else
            {
                if (val == null)
                    continue;

                url = `${url}${hasQuery ? "&" : "?"}${"{0}={1}".format(key, encodeURIComponent(val))}`;
                hasQuery = true;
            }
        }

        url = url.trim();
        while (url.endsWith("?") || url.endsWith("&"))
            url = url.substr(0, url.length - 1).trim();

        return url;
    }

    private _populateRouteParams(): void
    {
        let index = 1;
        for (const routeParam of this._extractTemplateParams(this._routeTemplate).map(t => new RouteParam(t)))
        {
            const key = routeParam.paramKey.toLowerCase();
            if (this._routeParamsRegistry[key])
                throw new ApplicationException("Invalid route template. Duplicate route params (case insensitive) detected.");

            routeParam.setOrder(index++);
            this._routeParamsRegistry[key] = routeParam;
            this._routeParams.push(routeParam);
        }
    }

    private _extractTemplateParams(routeTemplate: string): Array<string>
    {
        const templateParams = new Array<string>();
        let queryFound = false;
        let startFound = false;
        let startIndex = 0;

        for (let i = 0; i < routeTemplate.length; i++)
        {
            if (routeTemplate[i] === "?" && !startFound)
            {
                if (queryFound)
                    throw new ApplicationException("Invalid route template. Unresolvable '?' characters detected.");

                queryFound = true;
            }

            if (routeTemplate[i] === "{")
            {
                if (startFound)
                    throw new ApplicationException("Invalid route template. Braces do not match.");

                startFound = true;
                startIndex = i + 1;
            }
            else if (routeTemplate[i] === "}")
            {
                if (!startFound)
                    throw new ApplicationException("Invalid route template. Braces do not match.");

                let value = routeTemplate.substring(startIndex, i);
                value = value.trim();
                if (queryFound) value = value + "[Q]";
                templateParams.push(value);
                startFound = false;
            }
        }

        this._hasQuery = queryFound;

        return templateParams;
    }

    private _generateVueRoute(routeTemplate: string): string
    {
        for (const routeParam of this._routeParams)
        {
            const asItWas = "{" + routeParam.param + "}";
            if (!routeTemplate.contains(asItWas))
                throw new ApplicationException("Invalid route template.");

            routeTemplate = routeTemplate.replace(asItWas, `:${routeParam.paramKey}`);
        }

        if (routeTemplate.contains("?"))
        {
            const splitted = routeTemplate.split("?");
            if (splitted.length > 2)
                throw new ApplicationException("Invalid route template. Unresolvable '?' characters detected.");

            routeTemplate = splitted[0];
        }

        return routeTemplate;
    }

    private _populatePathSegments(): void
    {
        const routeTemplate = this._vueRoute!;
        const pathSegments = new Array<string>();

        pathSegments.push("/");

        for (const item of routeTemplate.split("/"))
        {
            if (item.isEmptyOrWhiteSpace() || item.startsWith(":"))
                continue;

            if (pathSegments.some(t => t === item))
                throw new ArgumentException("routeTemplate", "cannot contain duplicate segments");

            pathSegments.push(item);
        }

        this._pathSegments.push(...pathSegments);
    }

    private _generateRouteKey(): string
    {
        return this._pathSegments.join("/").replace("//", "/");
    }
}