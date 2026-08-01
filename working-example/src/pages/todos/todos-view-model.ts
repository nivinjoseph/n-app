import { ErrorHelper } from "@example/common";
import type { TodoService } from "@example/sdk";
import {
    type EventAggregator,
    type EventSubscription,
    PageViewModel,
    route,
} from "@nivinjoseph/n-app";
import { ConfigurationManager } from "@nivinjoseph/n-config";
import { given } from "@nivinjoseph/n-defensive";
import { inject } from "@nivinjoseph/n-ject";
import { TodoEvents } from "../../events.js";
import { Routes } from "../../routes.js";

@route(Routes.todos, Routes.todoList)
@inject("TodoService", "EventAggregator")
export class TodosViewModel extends PageViewModel {
    private readonly _todoService: TodoService;
    private readonly _eventAggregator: EventAggregator;
    private _changedSubscription: EventSubscription | null = null;
    private _todoCount: number = 0;
    private _isLoading: boolean = false;

    public get hasTodos(): boolean {
        return this._todoCount > 0;
    }

    public get isLoading(): boolean {
        return this._isLoading;
    }

    public get owner(): string {
        return ConfigurationManager.requireStringConfig("owner");
    }

    public constructor(
        todoService: TodoService,
        eventAggregator: EventAggregator,
    ) {
        super();

        given(todoService, "todoService").ensureHasValue().ensureIsObject();
        this._todoService = todoService;

        given(eventAggregator, "eventAggregator")
            .ensureHasValue()
            .ensureIsObject();
        this._eventAggregator = eventAggregator;
    }

    public override async init(): Promise<void> {
        await super.init();

        this.runAfterAwait(() => {
            this._changedSubscription = this._eventAggregator.subscribe(
                TodoEvents.changed,
                () => {
                    void this.refresh();
                },
            );
        });

        await this.refresh();
    }

    public override async dispose(): Promise<void> {
        this._changedSubscription?.unsubscribe();
        this._changedSubscription = null;
        await super.dispose();
    }

    public async refresh(): Promise<void> {
        this._isLoading = true;

        try {
            const all = await this._todoService.getAll();
            this.runAfterAwait(() => {
                this._todoCount = all.length;
                this._isLoading = false;
            });
        } catch (err) {
            const { message } = ErrorHelper.resolveErrorMessage(err);
            alert(message);

            this.runAfterAwait(() => {
                this._isLoading = false;
            });
        }
    }
}
