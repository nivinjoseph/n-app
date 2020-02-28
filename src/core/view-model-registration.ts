import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
// import { templateSymbol } from "./template";
import { ApplicationException } from "@nivinjoseph/n-exception";


export class ViewModelRegistration
{
    private readonly _name: string;
    private readonly _viewModel: Function;
    // private readonly _template: string;
    private readonly _render: Function;
    
    
    public get name(): string { return this._name; }
    public get viewModel(): Function { return this._viewModel; }
    // public get template(): string { return this._template; }
    public get render(): Function { return this._render; }
    
    
    public constructor(viewModel: Function)
    {
        given(viewModel, "viewModel").ensureHasValue();
        
        this._name = (" " + (<Object>viewModel).getTypeName().trim()).substr(1); // Shrey: Safari de-optimization
        if (!this._name.endsWith("ViewModel"))
            throw new ApplicationException(`Registered ViewModel '${this._name}' violates ViewModel naming convention.`);
        
        this._viewModel = viewModel;
        
        // if (!Reflect.hasOwnMetadata(templateSymbol, this._viewModel))
        //     throw new ApplicationException(`ViewModel'${this.name}' does not have @template applied.`);    
        
        // this._template = Reflect.getOwnMetadata(templateSymbol, this._viewModel);
        
        if ((<any>viewModel).options)
            this._render = (<any>viewModel).options.render;
        
        console.dir(viewModel);
    }
}