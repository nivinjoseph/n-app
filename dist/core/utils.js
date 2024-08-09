import { RouteInfo } from "./route-info.js";
import { given } from "@nivinjoseph/n-defensive";
// public
export class Utils // static class
 {
    static generateUrl(route, params, baseUrl) {
        given(route, "route").ensureHasValue().ensureIsString();
        given(params, "params").ensureIsObject();
        given(baseUrl, "baseUrl").ensureIsString();
        route = route.trim().replaceAll(" ", "");
        if (baseUrl != null && !baseUrl.isEmptyOrWhiteSpace()) {
            baseUrl = baseUrl.trim().replaceAll(" ", "");
            if (baseUrl.endsWith("/"))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);
            if (!route.startsWith("/"))
                route = "/" + route;
            route = baseUrl + route;
        }
        return params ? new RouteInfo(route, true).generateUrl(params) : route;
    }
    static getTypeName(value) {
        given(value, "value").ensureHasValue().ensureIsFunction();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value.___$typeName ?? (" " + value.getTypeName().trim()).substr(1); // Shrey: Safari de-optimization
    }
}
//# sourceMappingURL=utils.js.map