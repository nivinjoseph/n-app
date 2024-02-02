import { route, template } from "./../../../../../src/index.js";
import * as Routes from "./../../routes.js";
import { BasePageViewModel } from "../../base-page-view-model.js";


@template(require("./update-todo-view.html"))
@route(Routes.updateTodo)
export class UpdateTodoViewModel extends BasePageViewModel
{
    private readonly _message = "Update Todo View";


    public get message(): string { return this._message; }
}