import "@nivinjoseph/n-ext";
import { ClientApp, DefaultDialogService, DialogLocation } from "./../../src/index.js";
import { ScoreBoardViewModel } from "./components/score-board/score-board-view-model.js";
import type { ComponentInstaller, Registry } from "@nivinjoseph/n-ject";
import { InmemoryTodoRepository } from "./services/todo-repository/inmemory-todo-repository.js";
import { DashboardViewModel } from "./pages/dashboard/dashboard-view-model.js";
import { TestViewModel } from "./pages/test/test-view-model.js";
import { TodoViewModel } from "./pages/todo/todo-view-model.js";
import * as Routes from "./pages/routes.js";
// import { BindingTestViewModel } from "./components/binding-test/binding-test-view-model";
import { ScopedService } from "./services/scoped-service.js";
import { RedirectViewModel } from "./pages/redirect/redirect-view-model.js";



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

const pages = [DashboardViewModel, TestViewModel, TodoViewModel, RedirectViewModel];
// const pages = [DashboardViewModel, TestViewModel];

const dialogService = new DefaultDialogService({
    accentColor: "#7ab53b",
    dialogLocation: DialogLocation.bottomRight,
    newestOnTop: true,
    enableCloseButton: true
    // loadingScreen: "spinner"
});

const app = new ClientApp("#app", "router-view")
    .registerDialogService(dialogService)
    .useInstaller(new Installer())
    .registerComponents(ScoreBoardViewModel)
    .registerPages(...pages)
    .useHistoryModeRouting()
    .useAsInitialRoute(Routes.dashboard)
    .useAsUnknownRoute(Routes.test)
    // .useAsDefaultPageTitle("fooo")
    // .useAsDefaultPageMetadata({name: "description", content: "this is the default description"})
    ;

app.bootstrap();