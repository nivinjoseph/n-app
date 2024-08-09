import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";
import { persistSymbol } from "./persist.js";
import { templateSymbol } from "./template.js";
import { Utils } from "./utils.js";
export class ViewModelRegistration {
    _name;
    _viewModel;
    _template;
    _persist;
    _isCreated = false;
    get name() { return this._name; }
    get viewModel() { return this._viewModel; }
    get template() { return this._template; }
    get persist() { return this._persist; }
    get isCreated() { return this._isCreated; }
    constructor(viewModel) {
        given(viewModel, "viewModel").ensureHasValue().ensureIsFunction();
        this._name = Utils.getTypeName(viewModel);
        if (!this._name.endsWith("ViewModel"))
            throw new ApplicationException(`Registered ViewModel '${this._name}' violates ViewModel naming convention.`);
        this._viewModel = viewModel;
        const metadata = viewModel[Symbol.metadata];
        if (metadata == null) // if metadata object is null/undefined that means there were no decorators applied
            throw new ApplicationException(`ViewModel '${this._name}' does not have @template applied.`);
        const template = metadata[templateSymbol];
        if (template == null)
            throw new ApplicationException(`ViewModel '${this.name}' does not have @template applied.`);
        this._template = template;
        const shouldPersist = metadata[persistSymbol];
        if (shouldPersist)
            this._persist = true;
        else
            this._persist = false;
    }
    created() {
        this._isCreated = true;
    }
}
//# sourceMappingURL=view-model-registration.js.map