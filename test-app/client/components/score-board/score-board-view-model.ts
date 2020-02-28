import { element, bind, ComponentViewModel, template } from "./../../../../src/index";
import "./score-board-view.scss";
import { inject } from "@nivinjoseph/n-ject";
import { ScopedService } from "../../services/scoped-service";


@template(require("./score-board-view.html"))
@element("score-board")
@bind("score", "increment")   
@inject("ScopedService")    
export default class ScoreBoardViewModel extends ComponentViewModel
{
    // @ts-ignore
    private readonly _scopedService: ScopedService;
    private _playerFirstName: string = "Nivin";
    private _playerLastName: string = "Joseph";


    public get playerScore(): number { return this.getBound<number>("score"); }

    public get playerFirstName(): string { return this._playerFirstName; }
    public set playerFirstName(value: string) { this._playerFirstName = value; }

    public get playerLastName(): string { return this._playerLastName; }
    public set playerLastName(value: string) { this._playerLastName = value; }

    // public get playerFullName(): string { return this._playerFirstName + " " + this._playerLastName; }


    public constructor(scopedService: ScopedService)
    {
        super();
        this._scopedService = scopedService;
    }
    
    
    protected onCreate(): void
    {
        super.onCreate();
        
        this.watch<number>("playerScore", (val, old) =>
        {
            console.log(val, old);
        });
    }

    // public incrementScore(): void
    // {
    //     // console.log(this);
    //     // console.log("current score", currentScore);
    //     // console.log("name", this.playerFullName);
    //     // this.ctx["score"] += 1;
        
    //     this.ctx["increment"]();
    // }
    
    // protected onMount(element: HTMLElement): void
    // { 
    //     console.log("el", element);
    //     let hasChildren = element.hasChildNodes();
    //     console.log("hasChildren", hasChildren);
        
    //     jquery(element).html("<span>replaced</span>");
    // }
}  