import "@nivinjoseph/n-ext";
import type { PageViewModel, PageViewModelClass } from "./page-view-model.js";
export declare const metaSymbol: unique symbol;
export declare function meta<This extends PageViewModel>(...metas: readonly [MetaDetail, ...ReadonlyArray<MetaDetail>]): MetaPageViewModelDecorator<This>;
export type MetaDetail = {
    $key: string;
} & {
    [index: string]: string;
};
export type MetaPageViewModelDecorator<This extends PageViewModel> = (target: PageViewModelClass<This>, context: ClassDecoratorContext<PageViewModelClass<This>>) => void;
//# sourceMappingURL=meta.d.ts.map