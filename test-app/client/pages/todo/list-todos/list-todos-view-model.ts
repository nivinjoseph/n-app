import { route, template, resolve } from "./../../../../../src/index.js";
import * as Routes from "./../../routes.js";
import { BasePageViewModel } from "../../base-page-view-model.js";
import { TestResolverFoo } from "../../../resolvers/test-resolver-foo.js";


@template(require("./list-todos-view.html"))
@route(Routes.listTodos)
@resolve(TestResolverFoo)  
export class ListTodosViewModel extends BasePageViewModel
{
    private readonly _message = "List Todos View";
    
    
    public get message(): string { return this._message; }
}