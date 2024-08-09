import { BaseViewModel } from "./base-view-model.js";
import type { ClassDefinition } from "@nivinjoseph/n-util";
export declare abstract class ComponentViewModel extends BaseViewModel {
    private get _myBindings();
    private get _myEvents();
    private get _myProps();
    protected getBound<T>(propertyName: string): T;
    protected getBoundModel<T>(): T;
    protected setBoundModel(value: unknown): void;
    protected emit(event: string, ...eventArgs: Array<any>): void;
    private _camelCaseToKebabCase;
}
export type ComponentViewModelClass<T extends ComponentViewModel> = ClassDefinition<T>;
//# sourceMappingURL=component-view-model.d.ts.map