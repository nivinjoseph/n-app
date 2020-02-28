import "@babel/polyfill";

import { ClientApp } from "./../../src/index";
import ScoreBoardViewModel from "./components/score-board/score-board-view-model";
import { ComponentInstaller, Registry } from "@nivinjoseph/n-ject";
import { InmemoryTodoRepository } from "./services/todo-repository/inmemory-todo-repository";
import DashboardViewModel from "./pages/dashboard/dashboard-view-model";
import TestViewModel from "./pages/test/test-view-model";
import TodoViewModel from "./pages/todo/todo-view-model";
import ListTodosViewModel from "./pages/todo/list-todos/list-todos-view-model";
import CreateTodoViewModel from "./pages/todo/create-todo/create-todo-view-model";
import UpdateTodoViewModel from "./pages/todo/update-todo/update-todo-view-model";
import * as Routes from "./pages/routes";
import BindingTestViewModel from "./components/binding-test/binding-test-view-model";
import { ScopedService } from "./services/scoped-service";



// Vue.material.registerTheme("default", {
//     primary: "blue",
//     accent: "red",
//     warn: "red",
//     background: "grey"
// });

class Installer implements ComponentInstaller
{
    public install(registry: Registry): void
    {
        registry
            .registerSingleton("TodoRepository", InmemoryTodoRepository)
            .registerScoped("ScopedService", ScopedService)
            ;
    }
}    

const pages = [DashboardViewModel, TestViewModel, TodoViewModel, ListTodosViewModel, CreateTodoViewModel, UpdateTodoViewModel];
// const pages = [DashboardViewModel, TestViewModel];

const app = new ClientApp("#app")
    .useAccentColor("#7ab53b")
    .useInstaller(new Installer())
    .registerComponents(ScoreBoardViewModel, BindingTestViewModel)
    .registerPages(...pages)
    .useHistoryModeRouting()
    .useAsInitialRoute(Routes.dashboard)
    .useAsUnknownRoute(Routes.test)
    .useAsDefaultPageTitle("fooo")
    .useAsDefaultPageMetadata({name: "description", content: "this is the default description"})
    ;
    
app.bootstrap();