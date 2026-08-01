import { given } from "@nivinjoseph/n-defensive";
import { RouteInfo } from "./route-info.js";
// public
// biome-ignore lint/complexity/noStaticOnlyClass: nivin move
export class Utils {
    // static class
    static generateUrl(route, params, baseUrl) {
        given(route, "route").ensureHasValue().ensureIsString();
        given(params, "params").ensureIsObject();
        given(baseUrl, "baseUrl").ensureIsString();
        route = route.trim().replaceAll(" ", "");
        if (baseUrl != null && !baseUrl.isEmptyOrWhiteSpace()) {
            baseUrl = baseUrl.trim().replaceAll(" ", "");
            if (baseUrl.endsWith("/"))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);
            // biome-ignore lint/style/useTemplate: nivin move
            if (!route.startsWith("/"))
                route = "/" + route;
            route = baseUrl + route;
        }
        return params ? new RouteInfo(route, true).generateUrl(params) : route;
    }
    // biome-ignore lint/complexity/noBannedTypes: nivin  move
    static getTypeName(value) {
        given(value, "value").ensureHasValue().ensureIsFunction();
        return (
        // (<any>value).___$typeName ??
        // biome-ignore lint/style/useTemplate: nivin move
        // biome-ignore lint/complexity/noBannedTypes: nivin move
        (" " + value.getTypeName().trim()).substr(1)); // Safari de-optimization
    }
}
//# sourceMappingURL=utils.js.map