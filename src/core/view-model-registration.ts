import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";
import type { ComponentViewModelClass } from "./component-view-model.js";
import type { PageViewModelClass } from "./page-view-model.js";
import { persistSymbol } from "./persist.js";
import { templateSymbol } from "./template.js";
import { Utils } from "./utils.js";


export class ViewModelRegistration
{
    private readonly _name: string;
    private readonly _viewModel: PageViewModelClass<any> | ComponentViewModelClass<any>;
    private readonly _template: string | Function;
    private readonly _persist: boolean;

    private _isCreated = false;


    public get name(): string { return this._name; }
    public get viewModel(): PageViewModelClass<any> | ComponentViewModelClass<any> { return this._viewModel; }
    public get template(): string | Function { return this._template; }
    public get persist(): boolean { return this._persist; }

    public get isCreated(): boolean { return this._isCreated; }


    public constructor(viewModel: PageViewModelClass<any> | ComponentViewModelClass<any>)
    {
        given(viewModel, "viewModel").ensureHasValue().ensureIsFunction();

        this._name = Utils.getTypeName(viewModel);
        if (!this._name.endsWith("ViewModel"))
            throw new ApplicationException(`Registered ViewModel '${this._name}' violates ViewModel naming convention.`);

        this._viewModel = viewModel;

        const metadata = viewModel[Symbol.metadata];

        if (metadata == null) // if metadata object is null/undefined that means there were no decorators applied
            throw new ApplicationException(`ViewModel '${this._name}' does not have @template applied.`);

        const template = metadata[templateSymbol] as string | Function | undefined;
        if (template == null)
            throw new ApplicationException(`ViewModel '${this.name}' does not have @template applied.`);

        this._template = template;

        const shouldPersist = metadata[persistSymbol] as boolean | undefined;
        if (shouldPersist)
            this._persist = true;
        else
            this._persist = false;
    }

    public created(): void
    {
        this._isCreated = true;
    }
}