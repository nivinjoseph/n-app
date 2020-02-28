import { route, template } from "./../../../../../src/index";
import * as Routes from "./../../routes";
import { BasePageViewModel } from "../../base-page-viewmodel";


@template(require("./create-todo-view.html"))
@route(Routes.createTodo)
export default class CreateTodoViewModel extends BasePageViewModel
{
    private readonly _message = "Create Todo View";
    
    
    public get message(): string { return this._message; } 
}