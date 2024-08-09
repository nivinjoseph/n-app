import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import type { PageViewModel, PageViewModelClass } from "./page-view-model.js";

export const appRouteSymbol = Symbol.for("@nivinjoseph/n-app/appRoute");

// public
export function route<This extends PageViewModel>(route: string, redirect?: string): RoutePageViewModelDecorator<This>
{
    given(route, "route").ensureHasValue().ensureIsString()
        .ensure(t => t.trim().startsWith("/"), "has to begin with '/'");

    given(redirect, "redirect").ensureIsString()
        .ensure(t => t.trim().startsWith("/"), "has to begin with '/'")
        .ensure(t => t.trim().startsWith(route.trim()), "has to be a nested route")
        .ensure(t => t !== route, "route and redirect must not be same");


    route = route.trim().replaceAll(" ", "");
    redirect = redirect?.trim().replaceAll(" ", "");

    const decorator: RoutePageViewModelDecorator<This> = (_, context) =>
    {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "route decorator should only be used on a class");

        const className = context.name!;
        given(className, className).ensureHasValue().ensureIsString();

        context.metadata[appRouteSymbol] = {
            route,
            redirect
        } satisfies RouteDecoratorMetadata;
    };

    return decorator;
}

export type RouteDecoratorMetadata = {
    route: string;
    redirect?: string;
};


export type RoutePageViewModelDecorator<This extends PageViewModel> = (
    target: PageViewModelClass<This>,
    context: ClassDecoratorContext<PageViewModelClass<This>>
) => void;