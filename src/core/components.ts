import { given } from "@nivinjoseph/n-defensive";
import type { ComponentViewModel, ComponentViewModelClass } from "./component-view-model.js";
import type { PageViewModel, PageViewModelClass } from "./page-view-model.js";


export const componentsSymbol = Symbol.for("@nivinjoseph/n-app/components");

// public
export function components<This extends (ComponentViewModel | PageViewModel)>(...components: [ComponentViewModelClass<any>, ...Array<ComponentViewModelClass<any>>]): ComponentsViewModelDecorator<This>
{
    const decorator: ComponentsViewModelDecorator<This> = (_, context) =>
    {
        given(context, "context")
            // @ts-expect-error chill
            .ensure(t => t.kind === "class", "components decorator should only be used on a class");


        const className = context.name!;
        given(className, className).ensureHasValue().ensureIsString();

        context.metadata[componentsSymbol] = components;
    };

    return decorator;
}



export type ComponentsViewModelDecoratorTarget<This extends (ComponentViewModel | PageViewModel)> = This extends ComponentViewModel
    ? ComponentViewModelClass<This>
    : This extends PageViewModel ? PageViewModelClass<This>
    : never;

export type ComponentsViewModelDecoratorContext<This extends (ComponentViewModel | PageViewModel)> = This extends ComponentViewModel
    ? ClassDecoratorContext<ComponentViewModelClass<This>>
    : This extends PageViewModel ? ClassDecoratorContext<PageViewModelClass<This>>
    : never;
    
export type ComponentsViewModelDecorator<This extends (PageViewModel | ComponentViewModel)> = (
    target: ComponentsViewModelDecoratorTarget<This>,
    context: ComponentsViewModelDecoratorContext<This>
) => void;