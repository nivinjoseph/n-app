import { route, template, meta, type NavigationService, resolve, type EventAggregator, PageViewModel, components } from "./../../../../src/index.js";
import * as Routes from "./../routes.js";
import "./test-view.scss";
import { inject } from "@nivinjoseph/n-ject";
import type { TodoRepository } from "../../services/todo-repository/todo-repository.js";
import { given } from "@nivinjoseph/n-defensive";
import { TestResolverFoo } from "../../resolvers/test-resolver-foo.js";
import { TestResolverBar } from "../../resolvers/test-resolver-bar.js";
import { ComponentAViewModel } from "./components/component-a/component-a-view-model.js";
import { NonReorderableListViewModel } from "./components/non-reorderable-list/non-reorderable-list-view-model.js";
import { FileUploaderViewModel } from "./components/file-uploader/file-uploader-view-model.js";
import type { ScopedService } from "../../services/scoped-service.js";


@components(ComponentAViewModel, NonReorderableListViewModel, FileUploaderViewModel)
@template(require("./test-view.html"))
@route(Routes.test)
@meta({ $key: "name", name: "description", content: "This is test" })
@inject("TodoRepository", "NavigationService", "EventAggregator", "ScopedService")
@resolve(TestResolverBar, TestResolverFoo)
export class TestViewModel extends PageViewModel
{
    // @ts-expect-error: not used atm
    private readonly _todoRepository: TodoRepository;

    private readonly _navigationService: NavigationService;
    // @ts-expect-error: not used atm
    private readonly _eventAggregator: EventAggregator;
    private readonly _scopedService: ScopedService;
    private _id = 0;


    public get id(): number { return this._id; }

    public get players(): ReadonlyArray<Player> { return [{ name: "Shrey", nationality: null }, { name: "Albert", nationality: "India" }]; }

    public get scopedServiceValue(): number { return this._scopedService.value; }
    
    public constructor(todoRepository: TodoRepository, navigationService: NavigationService,
        eventAggregator: EventAggregator, scopedService: ScopedService)
    {
        super();

        given(todoRepository, "todoRepository").ensureHasValue().ensureIsObject();
        this._todoRepository = todoRepository;

        given(navigationService, "navigationService").ensureHasValue().ensureIsObject();
        this._navigationService = navigationService;

        given(eventAggregator, "eventAggregator").ensureHasValue().ensureIsObject();
        this._eventAggregator = eventAggregator;

        given(scopedService, "scopedService").ensureHasValue().ensureIsObject();
        this._scopedService = scopedService;
    }


    public go(id: number): void
    {
        this._navigationService.navigate(Routes.test, { id: ++id });

        // this._eventAggregator.publish("openFileSelect", "foo");
    }

    public onFileSelected(val: unknown): void
    {
        console.log("File data", val);
    }

    public clicked(player: Player): void
    {
        console.log(player.nationality);
    }

    public redirectTest(): void
    {
        this._navigationService.navigate(Routes.redirect);
    }

    protected override onCreate(): void
    {
        super.onCreate();

        console.log("test page on create");
    }

    protected override onEnter(arg: number, resolved1: string, resolved2: string): void
    {
        super.onEnter(arg, resolved1, resolved2);

        console.log("test page on enter");

        // console.log("resolved", resolved1);

        console.log("id is", arg);

        this._id = arg;
    }
}

export interface Player
{
    name: string;
    nationality: string | null;
}

// @template(require("./test-view.html"))
// @route(Routes.test)
// export class TestViewModel extends BasePageViewModel
// {
// }