import { route, template } from "./../../../../../src/index.js";
import * as Routes from "./../../routes.js";
import { BasePageViewModel } from "../../base-page-view-model.js";


@template(require("./create-todo-view.html"))
@route(Routes.createTodo)
export class CreateTodoViewModel extends BasePageViewModel
{
    private readonly _message = "Create Todo View";
    
    
    public get message(): string { return this._message; } 
}