import { type TypeStructure } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import type { ComponentViewModel, ComponentViewModelClass } from "./component-view-model.js";
export declare const bindSymbol: unique symbol;
export declare function bind<This extends ComponentViewModel>(schema: TypeStructure): BindComponentViewModelDecorator<This>;
export type BindComponentViewModelDecorator<This extends ComponentViewModel> = (target: ComponentViewModelClass<This>, context: ClassDecoratorContext<ComponentViewModelClass<This>>) => void;
//# sourceMappingURL=bind.d.ts.map