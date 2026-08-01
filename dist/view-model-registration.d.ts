import type { ClassHierarchy } from "@nivinjoseph/n-util";
import type { ViewModel } from "./view-model.js";
export declare class ComponentRegistration {
    private readonly _name;
    private readonly _viewModel;
    get name(): string;
    get viewModel(): ClassHierarchy<ViewModel>;
    constructor(viewModel: ClassHierarchy<ViewModel>);
}
//# sourceMappingURL=view-model-registration.d.ts.map