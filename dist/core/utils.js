"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_info_1 = require("./route-info");
const n_defensive_1 = require("n-defensive");
// public
class Utils // static class
 {
    static generateUrl(route, params, baseUrl) {
        n_defensive_1.given(route, "route").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        let url = route.trim();
        if (baseUrl !== undefined && baseUrl != null) {
            baseUrl = baseUrl.trim();
            if (baseUrl.endsWith("/"))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);
            if (!url.startsWith("/"))
                url = "/" + url;
        }
        else
            baseUrl = "";
        return params ? baseUrl + new route_info_1.RouteInfo(url).generateUrl(params) : baseUrl + url.replaceAll(" ", "");
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map