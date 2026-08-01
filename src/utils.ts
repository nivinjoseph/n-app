import { given } from "@nivinjoseph/n-defensive";
import { RouteInfo } from "./route-info.js";

// public
// biome-ignore lint/complexity/noStaticOnlyClass: nivin move
export abstract class Utils {
    // static class
    public static generateUrl(
        route: string,
        params?: object,
        baseUrl?: string,
    ): string {
        given(route, "route").ensureHasValue().ensureIsString();
        given(params as object, "params").ensureIsObject();
        given(baseUrl as string, "baseUrl").ensureIsString();

        route = route.trim().replaceAll(" ", "");

        if (baseUrl != null && !baseUrl.isEmptyOrWhiteSpace()) {
            baseUrl = baseUrl.trim().replaceAll(" ", "");
            if (baseUrl.endsWith("/"))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);

            // biome-ignore lint/style/useTemplate: nivin move
            if (!route.startsWith("/")) route = "/" + route;

            route = baseUrl + route;
        }

        return params ? new RouteInfo(route, true).generateUrl(params) : route;
    }

    // biome-ignore lint/complexity/noBannedTypes: nivin  move
    public static getTypeName(value: Function): string {
        given(value, "value").ensureHasValue().ensureIsFunction();
        return (
            // (<any>value).___$typeName ??
            // biome-ignore lint/style/useTemplate: nivin move
            // biome-ignore lint/complexity/noBannedTypes: nivin move
            (" " + (<Object>value).getTypeName().trim()).substr(1)
        ); // Safari de-optimization
    }
}
