import { given, type TypeStructure } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import type { ComponentViewModel, ComponentViewModelClass } from "./component-view-model.js";


export const bindSymbol = Symbol.for("@nivinjoseph/n-app/bind");

// public
export function bind<This extends ComponentViewModel>(schema: TypeStructure): BindComponentViewModelDecorator<This>
{
    given(schema, "schema").ensureHasValue().ensureIsObject();

    const decorator: BindComponentViewModelDecorator<This> = (_, context) =>
    {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "bind decorator should only be used on a class");

        const className = context.name!;
        given(className, className).ensureHasValue().ensureIsString();

        context.metadata[bindSymbol] = schema;
    };

    return decorator;
}


export type BindComponentViewModelDecorator<This extends ComponentViewModel> = (
    target: ComponentViewModelClass<This>,
    context: ClassDecoratorContext<ComponentViewModelClass<This>>
) => void;