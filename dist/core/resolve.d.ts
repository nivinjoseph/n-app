import type { ClassDefinition } from "@nivinjoseph/n-util";
import type { NavRoute } from "./nav-route.js";
import type { PageViewModel, PageViewModelClass } from "./page-view-model.js";
export declare const resolveSymbol: unique symbol;
export declare function resolve<This extends PageViewModel>(...resolvers: readonly [ResolverClass<any>, ...ReadonlyArray<ResolverClass<any>>]): ResolvePageViewModelDecorator<This>;
export interface Resolution {
    redirect?: string;
    value?: any;
}
export interface Resolver {
    resolve(from: NavRoute, to: NavRoute): Promise<Resolution>;
}
export type ResolverClass<T extends Resolver> = ClassDefinition<T>;
export type ResolveDecoratorMetadata = {
    name: string;
    value: ResolverClass<any>;
};
export type ResolvePageViewModelDecorator<This extends PageViewModel> = (target: PageViewModelClass<This>, context: ClassDecoratorContext<PageViewModelClass<This>>) => void;
//# sourceMappingURL=resolve.d.ts.map