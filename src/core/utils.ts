import { RouteInfo } from "./route-info";
import { given } from "n-defensive";


// public
export abstract class Utils // static class
{
    public static generateUrl(route: string, params?: object, baseUrl?: string): string
    {
        given(route, "route").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        
        let url = route.trim();

        if (baseUrl !== undefined && baseUrl != null)
        {
            baseUrl = baseUrl.trim();
            if (baseUrl.endsWith("/"))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);

            if (!url.startsWith("/"))
                url = "/" + url;
        }
        else
            baseUrl = "";
        
        return params ? baseUrl + new RouteInfo(url).generateUrl(params) : baseUrl + url.replaceAll(" ", "");
    }
}