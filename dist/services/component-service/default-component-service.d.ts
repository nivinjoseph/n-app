import type { ComponentViewModelClass } from "../../core/component-view-model.js";
import { ViewModelRegistration } from "../../core/view-model-registration.js";
import type { ComponentService } from "./component-service.js";
import type { ComponentOptions } from "./component-options.js";
export declare class DefaultComponentService implements ComponentService {
    compile(componentViewModelClass: ComponentViewModelClass<any>, cache?: boolean): ComponentOptions;
    create(registration: ViewModelRegistration, cache: boolean): ComponentOptions;
}
//# sourceMappingURL=default-component-service.d.ts.map