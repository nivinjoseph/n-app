import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import { PageViewModel, PageViewModelClass } from "./page-view-model.js";


export const titleSymbol = Symbol.for("@nivinjoseph/n-app/title");

// public
export function title<This extends PageViewModel>(title: string): TitlePageViewModelDecorator<This>
{
    given(title, "title").ensureHasValue().ensureIsString();
    title = title.trim();

    const decorator: TitlePageViewModelDecorator<This> = (target, context) =>
    {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "title decorator should only be used on a class");

        const className = context.name!;
        given(className, className).ensureHasValue().ensureIsString()
            .ensure(_ => target.prototype instanceof PageViewModel, `class '${className}' decorated with title must extend PageViewModel class`);

        context.metadata[titleSymbol] = title;
    };

    return decorator;
}


export type TitlePageViewModelDecorator<This extends PageViewModel> = (
    target: PageViewModelClass<This>,
    context: ClassDecoratorContext<PageViewModelClass<This>>
) => void;