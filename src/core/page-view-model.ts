import { RouteArgs } from "./route-args.js";
import { BaseViewModel } from "./base-view-model.js";
import "@nivinjoseph/n-ext";
import { given } from "@nivinjoseph/n-defensive";
import type { ClassDefinition } from "@nivinjoseph/n-util";


// public
export class PageViewModel extends BaseViewModel
{
    protected get currentRoute(): string
    {
        let route = this.ctx.$route.fullPath;
        while (route.endsWith("/") || route.endsWith("?"))
            route = route.substr(0, route.length - 1).trimRight();
        
        return route;
    }

    protected get pathArgs(): Object | null
    {
        const routeArgs: RouteArgs | null = (<any>this).__routeArgs;
        return routeArgs ? routeArgs.pathArgs : null;
    }

    protected get queryArgs(): Object | null
    {
        const routeArgs: RouteArgs | null = (<any>this).__routeArgs;
        return routeArgs ? routeArgs.queryArgs : null;
    }

    // override
    protected onEnter(...params: Array<any>): void
    {
        given(params, "params").ensureHasValue().ensureIsArray();
    }

    // override
    protected onLeave(): void
    {
        // deliberately empty
    }
}

export type PageViewModelClass<This extends PageViewModel> = ClassDefinition<This>; 