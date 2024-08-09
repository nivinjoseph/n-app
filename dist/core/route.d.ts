import "@nivinjoseph/n-ext";
import type { PageViewModel, PageViewModelClass } from "./page-view-model.js";
export declare const appRouteSymbol: unique symbol;
export declare function route<This extends PageViewModel>(route: string, redirect?: string): RoutePageViewModelDecorator<This>;
export type RouteDecoratorMetadata = {
    route: string;
    redirect?: string;
};
export type RoutePageViewModelDecorator<This extends PageViewModel> = (target: PageViewModelClass<This>, context: ClassDecoratorContext<PageViewModelClass<This>>) => void;
//# sourceMappingURL=route.d.ts.map