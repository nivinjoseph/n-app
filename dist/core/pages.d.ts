import type { PageViewModel, PageViewModelClass } from "./page-view-model.js";
export declare const pagesSymbol: unique symbol;
export declare function pages<This extends PageViewModel>(...pages: readonly [PageViewModelClass<any>, ...ReadonlyArray<PageViewModelClass<any>>]): PagesPageViewModelDecorator<This>;
export type PagesPageViewModelDecorator<This extends PageViewModel> = (target: PageViewModelClass<This>, context: ClassDecoratorContext<PageViewModelClass<This>>) => void;
//# sourceMappingURL=pages.d.ts.map