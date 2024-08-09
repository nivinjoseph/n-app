import "@nivinjoseph/n-ext";
import type { PageViewModel, PageViewModelClass } from "./page-view-model.js";
export declare const titleSymbol: unique symbol;
export declare function title<This extends PageViewModel>(title: string): TitlePageViewModelDecorator<This>;
export type TitlePageViewModelDecorator<This extends PageViewModel> = (target: PageViewModelClass<This>, context: ClassDecoratorContext<PageViewModelClass<This>>) => void;
//# sourceMappingURL=title.d.ts.map