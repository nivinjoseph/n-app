import "@nivinjoseph/n-ext";
import { ComponentViewModel, type ComponentViewModelClass } from "./component-view-model.js";
import type { PageViewModel, PageViewModelClass } from "./page-view-model.js";
export declare const templateSymbol: unique symbol;
export declare function template<This extends (PageViewModel | ComponentViewModel)>(template: string | Function): TemplateViewModelDecorator<This>;
export type TemplateDecoratorTarget<This extends (ComponentViewModel | PageViewModel)> = This extends ComponentViewModel ? ComponentViewModelClass<This> : This extends PageViewModel ? PageViewModelClass<This> : never;
export type TemplateDecoratorContext<This extends (ComponentViewModel | PageViewModel)> = This extends ComponentViewModel ? ClassDecoratorContext<ComponentViewModelClass<This>> : This extends PageViewModel ? ClassDecoratorContext<PageViewModelClass<This>> : never;
export type TemplateViewModelDecorator<This extends (ComponentViewModel | PageViewModel)> = (target: TemplateDecoratorTarget<This>, context: TemplateDecoratorContext<This>) => void;
//# sourceMappingURL=template.d.ts.map