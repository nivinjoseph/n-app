import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { Utils } from "./utils.js";
export class ComponentRegistration {
    _name;
    _viewModel;
    get name() {
        return this._name;
    }
    get viewModel() {
        return this._viewModel;
    }
    constructor(viewModel) {
        given(viewModel, "viewModel").ensureHasValue().ensureIsFunction();
        this._name = Utils.getTypeName(viewModel);
        if (!this._name.endsWith("ViewModel"))
            throw new ApplicationException(`Registered ViewModel '${this._name}' violates ViewModel naming convention.`);
        this._viewModel = viewModel;
    }
}
//# sourceMappingURL=view-model-registration.js.map