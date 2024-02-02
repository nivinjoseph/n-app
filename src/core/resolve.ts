import { given } from "@nivinjoseph/n-defensive";
import type { ClassDefinition } from "@nivinjoseph/n-util";
import type { NavRoute } from "./nav-route.js";
import type { PageViewModel, PageViewModelClass } from "./page-view-model.js";
import { Utils } from "./utils.js";



export const resolveSymbol = Symbol.for("@nivinjoseph/n-app/resolve");

// public
export function resolve<This extends PageViewModel>(...resolvers: readonly [ResolverClass<any>, ...ReadonlyArray<ResolverClass<any>>]): ResolvePageViewModelDecorator<This>
{
    given(resolvers, "resolvers").ensureHasValue().ensureIsArray().ensure(t => t.isNotEmpty);

    const mapped: Array<ResolveDecoratorMetadata> = resolvers.map(t =>
    {
        return {
            name: Utils.getTypeName(t),
            value: t
        };
    });

    const decorator: ResolvePageViewModelDecorator<This> = (_, context) =>
    {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "resolve decorator should only be used on a class");

        const className = context.name!;
        given(className, className).ensureHasValue().ensureIsString();

        context.metadata[resolveSymbol] = mapped;
    };

    return decorator;
}


// public
export interface Resolution
{
    redirect?: string;
    value?: any;
}

// public
export interface Resolver
{
    resolve(from: NavRoute, to: NavRoute): Promise<Resolution>;
}

export type ResolverClass<T extends Resolver> = ClassDefinition<T>;

export type ResolveDecoratorMetadata = {
    name: string;
    value: ResolverClass<any>;
};


export type ResolvePageViewModelDecorator<This extends PageViewModel> = (
    target: PageViewModelClass<This>,
    context: ClassDecoratorContext<PageViewModelClass<This>>
) => void;