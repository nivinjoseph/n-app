import { route, template, resolve } from "./../../../../src/index";
import * as Routes from "./../routes";
import { BasePageViewModel } from "../base-page-viewmodel";
import { TestResolverFoo } from "../../resolvers/test-resolver-foo";


@template(require("./todo-view.html"))
@route(Routes.todo, Routes.listTodos)
@resolve(TestResolverFoo)    
export default class TodoViewModel extends BasePageViewModel
{
    private readonly _message = "Todo View";
    
    
    public get message(): string { return this._message; }
}

