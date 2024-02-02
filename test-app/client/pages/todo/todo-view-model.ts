import { route, template, resolve, pages } from "./../../../../src/index.js";
import * as Routes from "./../routes.js";
import { BasePageViewModel } from "../base-page-view-model.js";
import { TestResolverFoo } from "../../resolvers/test-resolver-foo.js";
import { ListTodosViewModel } from "./list-todos/list-todos-view-model.js";
import { CreateTodoViewModel } from "./create-todo/create-todo-view-model.js";
import { UpdateTodoViewModel } from "./update-todo/update-todo-view-model.js";


@pages(ListTodosViewModel, CreateTodoViewModel, UpdateTodoViewModel)
@template(require("./todo-view.html"))
@route(Routes.todo, Routes.listTodos)
@resolve(TestResolverFoo)
export class TodoViewModel extends BasePageViewModel
{
    private readonly _message = "Todo View";


    public get message(): string { return this._message; }
}

