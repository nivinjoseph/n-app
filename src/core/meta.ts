import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import type { PageViewModel, PageViewModelClass } from "./page-view-model.js";


export const metaSymbol = Symbol.for("@nivinjoseph/n-app/meta");

// public
export function meta<This extends PageViewModel>(...metas: readonly [MetaDetail, ...ReadonlyArray<MetaDetail>]): MetaPageViewModelDecorator<This>
{
    given(metas, "metas").ensureHasValue().ensureIsArray()
        .ensure(t => t.isNotEmpty);

    const decorator: MetaPageViewModelDecorator<This> = (_, context) =>
    {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "meta decorator should only be used on a class");

        const className = context.name!;
        given(className, className).ensureHasValue().ensureIsString();

        context.metadata[metaSymbol] = metas;
    };

    return decorator;
}


export type MetaDetail = { $key: string; } & { [index: string]: string; };


export type MetaPageViewModelDecorator<This extends PageViewModel> = (
    target: PageViewModelClass<This>,
    context: ClassDecoratorContext<PageViewModelClass<This>>
) => void;