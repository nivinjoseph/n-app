import { given } from "@nivinjoseph/n-defensive";
import type { PageViewModel } from "./page-view-model.js";

export const appRouteSymbol = Symbol.for("@nivinjoseph/n-app/appRoute");

export interface AppRouteMetadata {
    readonly route: string;
    readonly redirect: string | undefined;
}

export function route(
    route: string,
    redirect?: string,
    // biome-ignore lint/suspicious/noExplicitAny: framework decorator needs variance-free base reference
): <T extends abstract new (...args: Array<any>) => PageViewModel<any>>(
    target: T,
    context: ClassDecoratorContext<T>,
) => void {
    given(route, "route")
        .ensureHasValue()
        .ensureIsString()
        .ensure((t) => t.trim().startsWith("/"), "has to begin with '/'");

    const normalizedRoute = route.trim().replaceAll(" ", "");
    let normalizedRedirect: string | undefined = redirect
        ?.trim()
        .replaceAll(" ", "");
    if (
        normalizedRedirect != null &&
        normalizedRedirect.length > 1 &&
        normalizedRedirect.endsWith("/")
    )
        normalizedRedirect = normalizedRedirect.slice(0, -1);

    given(normalizedRedirect as string, "redirect")
        .ensureIsString()
        .ensure(
            (t) => t.isNotEmptyOrWhiteSpace(),
            "cannot be empty or whitespace",
        )
        .ensure((t) => t.startsWith("/"), "has to begin with '/'")
        .ensure((t) => {
            if (!t.startsWith(normalizedRoute)) return false;
            let remainder = t.slice(normalizedRoute.length);
            if (remainder.startsWith("/")) remainder = remainder.slice(1);
            return remainder.length > 0;
        }, "has to be a strictly nested route, deeper than the parent");

    return (_target, context) => {
        const metadata = context.metadata;
        if (metadata == null)
            throw new Error(
                "@route requires Symbol.metadata support; upgrade the runtime or add a polyfill",
            );

        metadata[appRouteSymbol] = {
            route: normalizedRoute,
            redirect: normalizedRedirect,
        } satisfies AppRouteMetadata;
    };
}
