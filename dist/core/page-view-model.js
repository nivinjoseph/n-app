import { RouteArgs } from "./route-args.js";
import { BaseViewModel } from "./base-view-model.js";
import "@nivinjoseph/n-ext";
import { given } from "@nivinjoseph/n-defensive";
// public
export class PageViewModel extends BaseViewModel {
    get currentRoute() {
        let route = this.ctx.$route.fullPath;
        while (route.endsWith("/") || route.endsWith("?"))
            route = route.substr(0, route.length - 1).trimRight();
        return route;
    }
    get pathArgs() {
        const routeArgs = this.__routeArgs;
        return routeArgs ? routeArgs.pathArgs : null;
    }
    get queryArgs() {
        const routeArgs = this.__routeArgs;
        return routeArgs ? routeArgs.queryArgs : null;
    }
    // override
    onEnter(...params) {
        given(params, "params").ensureHasValue().ensureIsArray();
    }
    // override
    onLeave() {
        // deliberately empty
    }
}
//# sourceMappingURL=page-view-model.js.map