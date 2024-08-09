import "@nivinjoseph/n-ext";
import type { ComponentViewModel, ComponentViewModelClass } from "./component-view-model.js";
export declare const elementSymbol: unique symbol;
export declare function element<This extends ComponentViewModel>(elementName: string): ElementComponentViewModelDecorator<This>;
export type ElementComponentViewModelDecorator<This extends ComponentViewModel> = (target: ComponentViewModelClass<This>, context: ClassDecoratorContext<ComponentViewModelClass<This>>) => void;
//# sourceMappingURL=element.d.ts.map