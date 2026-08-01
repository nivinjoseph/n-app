import { ErrorHelper } from "@example/common";
import type { Todo, TodoService } from "@example/sdk";
import {
    type EventAggregator,
    makeValidatorObservable,
    PageViewModel,
    route,
} from "@nivinjoseph/n-app";
import { given } from "@nivinjoseph/n-defensive";
import { inject } from "@nivinjoseph/n-ject";
import { Validator } from "@nivinjoseph/n-validate";
import { TodoEvents } from "../../../../events.js";
import { Routes } from "../../../../routes.js";

@route(Routes.todoEdit)
@inject("TodoService", "EventAggregator")
export class TodoEditViewModel extends PageViewModel<{ id: string }> {
    private readonly _todoService: TodoService;
    private readonly _eventAggregator: EventAggregator;
    private readonly _validator: Validator<this>;
    private _todo: Todo | null = null;
    private _draftTitle: string = "";
    private _draftDescription: string = "";
    private _isLoading: boolean = false;
    private _isSaving: boolean = false;

    public get draftTitle(): string {
        return this._draftTitle;
    }
    public set draftTitle(value: string) {
        this._draftTitle = value;
    }

    public get draftDescription(): string {
        return this._draftDescription;
    }
    public set draftDescription(value: string) {
        this._draftDescription = value;
    }

    public get isLoading(): boolean {
        return this._isLoading;
    }
    public get isSaving(): boolean {
        return this._isSaving;
    }
    public get isReady(): boolean {
        return this._todo !== null;
    }

    public get hasErrors(): boolean {
        return this._validator.hasErrors;
    }
    public get errors(): Record<keyof TodoEditViewModel, string | undefined> {
        return this._validator.errors;
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

        this._validator = makeValidatorObservable(
            this._createValidator(),
            this,
        );
    }

    public override async init(): Promise<void> {
        await super.init();

        this.runAfterAwait(() => {
            this._isLoading = true;
        });

        const { id } = this.retrieveParams();
        given(id, "id").ensureHasValue().ensureIsString();

        try {
            const todo = await this._todoService.get(id);
            this.runAfterAwait(() => {
                this._todo = todo;
                this._draftTitle = todo.title;
                this._draftDescription = todo.description ?? "";
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

    public async save(): Promise<void> {
        if (this._todo === null) return;

        this._validator.enable();
        if (this._validator.hasErrors) return;

        const title = this._draftTitle.trim();
        const description = this._draftDescription.trim();

        this._isSaving = true;

        try {
            await this._todo.updateTitle(title);
            await this._todo.updateDescription(description);
            this._eventAggregator.publish(TodoEvents.changed);
            this.runAfterAwait(() => {
                this._isSaving = false;
            });
            this.goTo(Routes.todoList);
        } catch (err) {
            const { message } = ErrorHelper.resolveErrorMessage(err);
            alert(message);

            this.runAfterAwait(() => {
                this._isSaving = false;
            });
        }
    }

    private _createValidator(): Validator<this> {
        const validator = new Validator<this>(true);

        validator
            .prop("draftTitle")
            .isRequired()
            .withMessage("Title is required.")
            .isString()
            .hasMaxLength(64);

        validator
            .prop("draftDescription")
            .isOptional()
            .isString()
            .hasMaxLength(128);

        return validator;
    }
}
