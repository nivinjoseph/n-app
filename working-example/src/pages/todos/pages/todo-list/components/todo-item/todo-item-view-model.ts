import { ErrorHelper } from "@example/common";
import type { Todo, TodoService } from "@example/sdk";
import { ComponentViewModel, Utils } from "@nivinjoseph/n-app";
import { given } from "@nivinjoseph/n-defensive";
import { inject } from "@nivinjoseph/n-ject";
import { Routes } from "../../../../../../routes.js";
import { TodoListViewModel } from "../../todo-list-view-model.js";

@inject(Utils.getTypeName(TodoListViewModel), "TodoService")
export class TodoItemViewModel extends ComponentViewModel<{ todoId: string }> {
    private readonly _list: TodoListViewModel;
    private readonly _todoService: TodoService;
    private _todo: Todo | null = null;
    private _isLoading: boolean = false;
    private _error: string | null = null;
    private _isCompleting: boolean = false;
    private _isCompletedMessageOpen: boolean = false;

    public get todo(): Todo | null {
        return this._todo;
    }
    public get isLoading(): boolean {
        return this._isLoading;
    }
    public get error(): string | null {
        return this._error;
    }
    public get isCompleting(): boolean {
        return this._isCompleting;
    }
    public get isCompletedMessageOpen(): boolean {
        return this._isCompletedMessageOpen;
    }

    public constructor(list: TodoListViewModel, todoService: TodoService) {
        super();

        given(list, "list").ensureHasValue().ensureIsObject();
        this._list = list;

        given(todoService, "todoService").ensureHasValue().ensureIsObject();
        this._todoService = todoService;
    }

    public override async init(): Promise<void> {
        await super.init();

        const { todoId } = this.retrieveProps();

        this.runAfterAwait(() => {
            this._isLoading = true;
            this._error = null;
        });

        try {
            const todo = await this._todoService.get(todoId);
            this.runAfterAwait(() => {
                this._todo = todo;
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

    public async complete(): Promise<void> {
        if (this._todo === null) return;
        if (this._todo.isCompleted) return;
        if (this._isCompleting) return;

        this._isCompleting = true;
        try {
            await this._list.completeTodo(this._todo);
            this.runAfterAwait(() => {
                this._isCompletedMessageOpen = true;
            });
        } finally {
            this.runAfterAwait(() => {
                this._isCompleting = false;
                this.forceRefresh();
            });
        }
    }

    public dismissCompletedMessage(): void {
        this._isCompletedMessageOpen = false;
    }

    public openEdit(): void {
        if (this._todo == null || this._todo.isCompleted) return;

        this._list.goTo(
            Utils.generateUrl(Routes.todoEdit, { id: this._todo.id }),
        );
    }
}
