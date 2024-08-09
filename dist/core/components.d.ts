import type { ComponentViewModel, ComponentViewModelClass } from "./component-view-model.js";
import type { PageViewModel, PageViewModelClass } from "./page-view-model.js";
export declare const componentsSymbol: unique symbol;
export declare function components<This extends (ComponentViewModel | PageViewModel)>(...components: [ComponentViewModelClass<any>, ...Array<ComponentViewModelClass<any>>]): ComponentsViewModelDecorator<This>;
export type ComponentsViewModelDecoratorTarget<This extends (ComponentViewModel | PageViewModel)> = This extends ComponentViewModel ? ComponentViewModelClass<This> : This extends PageViewModel ? PageViewModelClass<This> : never;
export type ComponentsViewModelDecoratorContext<This extends (ComponentViewModel | PageViewModel)> = This extends ComponentViewModel ? ClassDecoratorContext<ComponentViewModelClass<This>> : This extends PageViewModel ? ClassDecoratorContext<PageViewModelClass<This>> : never;
export type ComponentsViewModelDecorator<This extends (PageViewModel | ComponentViewModel)> = (target: ComponentsViewModelDecoratorTarget<This>, context: ComponentsViewModelDecoratorContext<This>) => void;
//# sourceMappingURL=components.d.ts.map