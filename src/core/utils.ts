import { RouteInfo } from "./route-info.js";
import { given } from "@nivinjoseph/n-defensive";


// public
export abstract class Utils // static class
{
    public static generateUrl(route: string, params?: object, baseUrl?: string): string
    {
        given(route, "route").ensureHasValue().ensureIsString();
        given(params as object, "params").ensureIsObject();
        given(baseUrl as string, "baseUrl").ensureIsString();

        route = route.trim().replaceAll(" ", "");

        if (baseUrl != null && !baseUrl.isEmptyOrWhiteSpace())
        {
            baseUrl = baseUrl.trim().replaceAll(" ", "");
            if (baseUrl.endsWith("/"))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);

            if (!route.startsWith("/"))
                route = "/" + route;

            route = baseUrl + route;
        }

        return params ? new RouteInfo(route, true).generateUrl(params) : route;
    }
    
    public static getTypeName(value: Function): string
    {
        given(value, "value").ensureHasValue().ensureIsFunction();
        
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return (<any>value).___$typeName ?? (" " + (<Object>value).getTypeName().trim()).substr(1); // Shrey: Safari de-optimization
    }
}