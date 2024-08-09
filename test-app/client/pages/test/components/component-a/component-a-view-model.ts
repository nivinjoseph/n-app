// eslint-disable-next-line @typescript-eslint/triple-slash-reference
import { bind, ComponentViewModel, element, template } from "../../../../../../src/index.js";
import "./component-a-view.scss";

@template(require("./component-a-view.html"))
@element("component-a")
@bind({
    sport: {
        name: "string",
        "nationality?": "string"
    },
    "num?": "number"
})
export class ComponentAViewModel extends ComponentViewModel
{
    // private readonly _names = ["Shrey", "Nivin", "Albert"];
    
    // private readonly _workbook: GC.Spread.Sheets.Workbook | null = null;
    
    public get value(): number { return this.getBound("num"); }
    
    public get sportValue(): { name: string; }  { return this.getBound("sport"); }
    
    // public get workbook(): GC.Spread.Sheets.Workbook | null { return this._workbook; }
    
    protected override onCreate(): void
    {
        super.onCreate();
        
        console.log("component A on create");
    }
    
    protected override onMount(element: HTMLElement): void
    {
        super.onMount(element);
        
        console.log("component A on mount");
    }
}