import type { ComponentViewModelClass } from "./component-view-model.js";
import { ViewModelRegistration } from "./view-model-registration.js";
export declare class ComponentRegistration extends ViewModelRegistration {
    private readonly _element;
    private readonly _bindings;
    private readonly _bindingSchema;
    private readonly _hasModel;
    private readonly _events;
    private readonly _localComponentRegistrations;
    get element(): string;
    get bindings(): Array<ComponentBindingInfo>;
    get bindingSchema(): object;
    get hasModel(): boolean;
    get events(): Array<string>;
    get localComponentRegistrations(): Array<ComponentRegistration>;
    constructor(component: ComponentViewModelClass<any>);
}
export interface ComponentBindingInfo {
    name: string;
    isOptional: boolean;
    type: any;
}
//# sourceMappingURL=component-registration.d.ts.map