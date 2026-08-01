import { ErrorHelper } from "@example/common";
import type { Todo, TodoService } from "@example/sdk";
import { type EventAggregator, PageViewModel, route } from "@nivinjoseph/n-app";
import { given } from "@nivinjoseph/n-defensive";
import { inject } from "@nivinjoseph/n-ject";
import { TodoEvents } from "../../../../events.js";
import { Routes } from "../../../../routes.js";

@route(Routes.todoList)
@inject("TodoService", "EventAggregator")
export class TodoListViewModel extends PageViewModel {
    private readonly _todoService: TodoService;
    private readonly _eventAggregator: EventAggregator;
    private _todos: ReadonlyArray<Todo> = [];
    private _isLoading: boolean = false;
    private _error: string | null = null;

    public get todos(): ReadonlyArray<Todo> {
        return this._todos;
    }
    public get isLoading(): boolean {
        return this._isLoading;
    }
    public get error(): string | null {
        return this._error;
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

        await this._load();

        // deliberate error triggering here to test error handling at the router level
        // if (this._todos.length > 2)
        //     throw new Error(
        //         `Too many todos to display (${this._todos.length}). Limit is 2.`,
        //     );
    }

    public async completeTodo(todo: Todo): Promise<void> {
        try {
            await todo.complete();
            this._eventAggregator.publish(TodoEvents.changed);
            await this._load();
        } catch (err) {
            const { message } = ErrorHelper.resolveErrorMessage(err);
            alert(message);

            this.runAfterAwait(() => {
                this._error = err instanceof Error ? err.message : String(err);
            });
        }
    }

    private async _load(): Promise<void> {
        this._isLoading = true;
        this._error = null;

        try {
            const all = await this._todoService.getAll();
            this.runAfterAwait(() => {
                this._todos = all;
                this._isLoading = false;
            });
        } catch (err) {
            const { message } = ErrorHelper.resolveErrorMessage(err);
            alert(message);

            this.runAfterAwait(() => {
                this._error = err instanceof Error ? err.message : String(err);
                this._isLoading = false;
            });
        }
    }
}
