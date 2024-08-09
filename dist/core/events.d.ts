import "@nivinjoseph/n-ext";
import type { ComponentViewModel, ComponentViewModelClass } from "./component-view-model.js";
export declare const eventsSymbol: unique symbol;
export declare function events<This extends ComponentViewModel>(...events: readonly [string, ...ReadonlyArray<string>]): EventsComponentViewModelDecorator<This>;
export type EventsComponentViewModelDecorator<This extends ComponentViewModel> = (target: ComponentViewModelClass<This>, context: ClassDecoratorContext<ComponentViewModelClass<This>>) => void;
//# sourceMappingURL=events.d.ts.map