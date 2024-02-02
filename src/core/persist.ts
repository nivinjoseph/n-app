import "@nivinjoseph/n-ext";
import { given } from "@nivinjoseph/n-defensive";
import { ComponentViewModel, type ComponentViewModelClass } from "./component-view-model.js";
import type { PageViewModel, PageViewModelClass } from "./page-view-model.js";


export const persistSymbol = Symbol.for("@nivinjoseph/n-app/persist");

// public
export function persist<This extends (ComponentViewModel | PageViewModel)>(_: PersistDecoratorTarget<This>, context: PersistDecoratorContext<This>): void
{
    given(context, "context")
        // @ts-expect-error chill
        .ensure(t => t.kind === "class", "persist decorator should only be used on a class");

    const className = context.name!;
    given(className, className).ensureHasValue().ensureIsString();

    context.metadata[persistSymbol] = true;
}




export type PersistDecoratorTarget<This extends (ComponentViewModel | PageViewModel)> = This extends ComponentViewModel
    ? ComponentViewModelClass<This>
    : This extends PageViewModel ? PageViewModelClass<This>
    : never;

export type PersistDecoratorContext<This extends (ComponentViewModel | PageViewModel)> = This extends ComponentViewModel
    ? ClassDecoratorContext<ComponentViewModelClass<This>>
    : This extends PageViewModel ? ClassDecoratorContext<PageViewModelClass<This>>
    : never;
