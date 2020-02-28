import { route, template, DialogService, EventAggregator, NavigationService, StorageService, title } from "./../../../../src/index";
import * as Routes from "./../routes";
import { BasePageViewModel } from "../base-page-viewmodel";
import { inject } from "@nivinjoseph/n-ject";
import "./dashboard-view.scss";
import { ScopedService } from "../../services/scoped-service";


@template(require("./dashboard-view.html"))
@route(Routes.dashboard)  
@title("Dashboard")    
@inject("DialogService", "EventAggregator", "NavigationService", "StorageService", "ScopedService")    
export default class DashboardViewModel extends BasePageViewModel
{
    private readonly _dialogService: DialogService;
    // @ts-ignore
    private readonly _eventAggregator: EventAggregator;
    // @ts-ignore
    private readonly _navigationService: NavigationService;
    // @ts-ignore
    private readonly _storageService: StorageService;
    // @ts-ignore
    private readonly _scopedService: ScopedService;
    
    
    private readonly _message = "Dashboard view";
    private _score = 10;
    private _fooParentValue: string;
    
    
    public constructor(dialogService: DialogService, evenAggregator: EventAggregator,
        navigationService: NavigationService, storageService: StorageService, scopedService: ScopedService)
    {
        super();
        
        this._dialogService = dialogService;
        this._eventAggregator = evenAggregator;
        this._navigationService = navigationService;
        this._storageService = storageService;
        this._scopedService = scopedService;
        
        this._fooParentValue = "whatever";
        
        this.executeOnDestroy(() => console.log("Destroying dashboard"));
    }
    
    
    
    public get score(): number { return this._score; }
    
    
    public get message(): string { return this._message; }
    
    
    public get fooParentValue(): string { return this._fooParentValue; }
    public set fooParentValue(value: string) { this._fooParentValue = value; }
    
    
    public increment(): void
    {
        this._score++;
        
        this._dialogService.showWarningMessage("Score incremented");
        
        // this._dialogService.showLoadingScreen();
        // setTimeout(() => this._dialogService.hideLoadingScreen(), 5000);
        
        // this._dialogService.showErrorMessage("haha");
        
        // this._navigationService.navigate(Routes.updateTodo, { id: 5 });
    }
}