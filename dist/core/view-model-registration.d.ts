import "@nivinjoseph/n-ext";
import type { ComponentViewModelClass } from "./component-view-model.js";
import type { PageViewModelClass } from "./page-view-model.js";
export declare class ViewModelRegistration {
    private readonly _name;
    private readonly _viewModel;
    private readonly _template;
    private readonly _persist;
    private _isCreated;
    get name(): string;
    get viewModel(): PageViewModelClass<any> | ComponentViewModelClass<any>;
    get template(): string | Function;
    get persist(): boolean;
    get isCreated(): boolean;
    constructor(viewModel: PageViewModelClass<any> | ComponentViewModelClass<any>);
    created(): void;
}
//# sourceMappingURL=view-model-registration.d.ts.map