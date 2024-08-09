import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import { ApplicationException, ArgumentException } from "@nivinjoseph/n-exception";
import { RouteParam } from "./route-param.js";
// route template format: /api/Product/{id:number}?{name?:string}&{all:boolean}
export class RouteInfo {
    _routeTemplate;
    _routeParams = new Array();
    _routeParamsRegistry = {};
    _vueRoute = null;
    _pathSegments = new Array();
    _routeKey = null;
    _hasQuery = false;
    get route() { return this._routeTemplate; }
    get vueRoute() {
        given(this, "this").ensure(t => t._vueRoute != null, "not available in UrlGenerator mode");
        return this._vueRoute;
    }
    get params() { return this._routeParams; }
    get pathSegments() { return this._pathSegments; }
    get routeKey() {
        given(this, "this").ensure(t => t._routeKey != null, "not available in UrlGenerator mode");
        return this._routeKey;
    }
    constructor(routeTemplate, isUrlGenerator = false) {
        given(routeTemplate, "routeTemplate")
            .ensureHasValue()
            .ensure(t => !t.isEmptyOrWhiteSpace());
        routeTemplate = routeTemplate.trim().replaceAll(" ", "");
        if (!isUrlGenerator) {
            given(routeTemplate, "routeTemplate")
                .ensure(t => t.startsWith("/"), "has to start with '/'")
                .ensure(t => !t.contains("//"), "cannot contain '//'");
            if (routeTemplate.length > 1 && routeTemplate.endsWith("/"))
                routeTemplate = routeTemplate.substr(0, routeTemplate.length - 1);
        }
        this._routeTemplate = routeTemplate;
        this._populateRouteParams();
        if (!isUrlGenerator) {
            this._vueRoute = this._generateVueRoute(this._routeTemplate);
            this._populatePathSegments();
            this._routeKey = this._generateRouteKey();
        }
    }
    findRouteParam(key) {
        given(key, "key").ensureHasValue().ensureIsString();
        return this._routeParamsRegistry[key.trim().toLowerCase()];
    }
    generateUrl(values) {
        given(values, "values").ensureHasValue().ensureIsObject();
        let url = this._routeTemplate;
        let hasQuery = this._hasQuery;
        for (const key in values) {
            const routeParam = this.findRouteParam(key);
            const val = values.getValue(key);
            if (routeParam) {
                const param = "{" + routeParam.param + "}";
                let replacement = routeParam.isQuery
                    ? "{0}={1}".format(key, encodeURIComponent(val))
                    : encodeURIComponent(val);
                if (val == null && routeParam.isQuery && routeParam.isOptional) // only query params can be optional anyway
                    replacement = "";
                url = url.replace(param, replacement);
            }
            else {
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
    _populateRouteParams() {
        let index = 1;
        for (const routeParam of this._extractTemplateParams(this._routeTemplate).map(t => new RouteParam(t))) {
            const key = routeParam.paramKey.toLowerCase();
            if (this._routeParamsRegistry[key])
                throw new ApplicationException("Invalid route template. Duplicate route params (case insensitive) detected.");
            routeParam.setOrder(index++);
            this._routeParamsRegistry[key] = routeParam;
            this._routeParams.push(routeParam);
        }
    }
    _extractTemplateParams(routeTemplate) {
        const templateParams = new Array();
        let queryFound = false;
        let startFound = false;
        let startIndex = 0;
        for (let i = 0; i < routeTemplate.length; i++) {
            if (routeTemplate[i] === "?" && !startFound) {
                if (queryFound)
                    throw new ApplicationException("Invalid route template. Unresolvable '?' characters detected.");
                queryFound = true;
            }
            if (routeTemplate[i] === "{") {
                if (startFound)
                    throw new ApplicationException("Invalid route template. Braces do not match.");
                startFound = true;
                startIndex = i + 1;
            }
            else if (routeTemplate[i] === "}") {
                if (!startFound)
                    throw new ApplicationException("Invalid route template. Braces do not match.");
                let value = routeTemplate.substring(startIndex, i);
                value = value.trim();
                if (queryFound)
                    value = value + "[Q]";
                templateParams.push(value);
                startFound = false;
            }
        }
        this._hasQuery = queryFound;
        return templateParams;
    }
    _generateVueRoute(routeTemplate) {
        for (const routeParam of this._routeParams) {
            const asItWas = "{" + routeParam.param + "}";
            if (!routeTemplate.contains(asItWas))
                throw new ApplicationException("Invalid route template.");
            routeTemplate = routeTemplate.replace(asItWas, `:${routeParam.paramKey}`);
        }
        if (routeTemplate.contains("?")) {
            const splitted = routeTemplate.split("?");
            if (splitted.length > 2)
                throw new ApplicationException("Invalid route template. Unresolvable '?' characters detected.");
            routeTemplate = splitted[0];
        }
        return routeTemplate;
    }
    _populatePathSegments() {
        const routeTemplate = this._vueRoute;
        const pathSegments = new Array();
        pathSegments.push("/");
        for (const item of routeTemplate.split("/")) {
            if (item.isEmptyOrWhiteSpace() || item.startsWith(":"))
                continue;
            if (pathSegments.some(t => t === item))
                throw new ArgumentException("routeTemplate", "cannot contain duplicate segments");
            pathSegments.push(item);
        }
        this._pathSegments.push(...pathSegments);
    }
    _generateRouteKey() {
        return this._pathSegments.join("/").replace("//", "/");
    }
}
//# sourceMappingURL=route-info.js.map