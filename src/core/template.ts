import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import { ComponentViewModel, type ComponentViewModelClass } from "./component-view-model.js";
import type { PageViewModel, PageViewModelClass } from "./page-view-model.js";


export const templateSymbol = Symbol.for("@nivinjoseph/n-app/template");

// public
export function template<This extends (PageViewModel | ComponentViewModel)>(template: string | Function): TemplateViewModelDecorator<This>
{
    given(template, "template").ensureHasValue();

    if (typeof template === "string")
        given(template, "template").ensureIsString();
    else
        given(template, "template").ensureIsFunction();


    const decorator: TemplateViewModelDecorator<This> = (_, context) =>
    {
        given(context, "context")
            // @ts-expect-error chill
            .ensure(t => t.kind === "class", "template decorator should only be used on a class");

        const className = context.name!;
        given(className, className).ensureHasValue().ensureIsString();

        context.metadata[templateSymbol] = template;
    };

    return decorator;
}


export type TemplateDecoratorTarget<This extends (ComponentViewModel | PageViewModel)> = This extends ComponentViewModel
    ? ComponentViewModelClass<This>
    : This extends PageViewModel ? PageViewModelClass<This>
    : never;

export type TemplateDecoratorContext<This extends (ComponentViewModel | PageViewModel)> = This extends ComponentViewModel
    ? ClassDecoratorContext<ComponentViewModelClass<This>>
    : This extends PageViewModel ? ClassDecoratorContext<PageViewModelClass<This>>
    : never;


export type TemplateViewModelDecorator<This extends (ComponentViewModel | PageViewModel)> = (
    target: TemplateDecoratorTarget<This>,
    context: TemplateDecoratorContext<This>
) => void;