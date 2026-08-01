import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import type { ClassHierarchy } from "@nivinjoseph/n-util";
import { Utils } from "./utils.js";
import type { ViewModel } from "./view-model.js";

export class ComponentRegistration {
    private readonly _name: string;
    private readonly _viewModel: ClassHierarchy<ViewModel>;

    public get name(): string {
        return this._name;
    }

    public get viewModel(): ClassHierarchy<ViewModel> {
        return this._viewModel;
    }

    public constructor(viewModel: ClassHierarchy<ViewModel>) {
        given(viewModel, "viewModel").ensureHasValue().ensureIsFunction();

        this._name = Utils.getTypeName(viewModel);
        if (!this._name.endsWith("ViewModel"))
            throw new ApplicationException(
                `Registered ViewModel '${this._name}' violates ViewModel naming convention.`,
            );

        this._viewModel = viewModel;
    }
}
