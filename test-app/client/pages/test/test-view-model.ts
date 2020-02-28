import { route, template, meta, NavigationService, resolve, EventAggregator } from "./../../../../src/index";
import * as Routes from "./../routes";
import { BasePageViewModel } from "../base-page-viewmodel";
import "./test-view.scss";
import { inject } from "@nivinjoseph/n-ject";
import { TodoRepository } from "../../services/todo-repository/todo-repository";
import { given } from "@nivinjoseph/n-defensive";
import { TestResolverFoo } from "../../resolvers/test-resolver-foo";
import { TestResolverBar } from "../../resolvers/test-resolver-bar";


@template(require("./test-view.html"))
@route(Routes.test)
@meta({name: "description", content: "This is test"})    
@inject("TodoRepository", "NavigationService", "EventAggregator")    
@resolve(TestResolverBar, TestResolverFoo) 
export default class TestViewModel extends BasePageViewModel
{
    // @ts-ignore
    private readonly _todoRepository: TodoRepository;
    // @ts-ignore
    private readonly _navigationService: NavigationService;
    private readonly _eventAggregator: EventAggregator;
    private _id: number = 0;
    
    
    public get id(): number { return this._id; }
    
    
    public constructor(todoRepository: TodoRepository, navigationService: NavigationService, eventAggregator: EventAggregator)
    {
        super();
        
        given(todoRepository, "todoRepository").ensureHasValue().ensureIsObject();
        this._todoRepository = todoRepository;
        
        given(navigationService, "navigationService").ensureHasValue().ensureIsObject();
        this._navigationService = navigationService;
        
        given(eventAggregator, "eventAggregator").ensureHasValue().ensureIsObject();
        this._eventAggregator = eventAggregator;
    }
    
    
    public go(): void
    {
        // this._navigationService.navigate(Routes.test, { id: this._id });
        
        this._eventAggregator.publish("openFileSelect", "foo");
    }
    
    public onFileSelected(val: any): void
    {
        console.log("File data", val);
    }
    
    
    protected onEnter(arg: any, resolved1: string, resolved2: string): void
    {
        super.onEnter(arg, resolved1, resolved2);
           
        // console.log("resolved", resolved1);
        
        console.log("id is", arg);
        
        this._id = ++arg;
    }
}


// @template(require("./test-view.html"))
// @route(Routes.test)
// export class TestViewModel extends BasePageViewModel
// {
// }