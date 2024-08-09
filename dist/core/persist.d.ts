import "@nivinjoseph/n-ext";
import { ComponentViewModel, type ComponentViewModelClass } from "./component-view-model.js";
import type { PageViewModel, PageViewModelClass } from "./page-view-model.js";
export declare const persistSymbol: unique symbol;
export declare function persist<This extends (ComponentViewModel | PageViewModel)>(_: PersistDecoratorTarget<This>, context: PersistDecoratorContext<This>): void;
export type PersistDecoratorTarget<This extends (ComponentViewModel | PageViewModel)> = This extends ComponentViewModel ? ComponentViewModelClass<This> : This extends PageViewModel ? PageViewModelClass<This> : never;
export type PersistDecoratorContext<This extends (ComponentViewModel | PageViewModel)> = This extends ComponentViewModel ? ClassDecoratorContext<ComponentViewModelClass<This>> : This extends PageViewModel ? ClassDecoratorContext<PageViewModelClass<This>> : never;
//# sourceMappingURL=persist.d.ts.map