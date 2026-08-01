import { ErrorHelper } from "@example/common";
import type { TodoService } from "@example/sdk";
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

@route(Routes.todoCreate)
@inject("TodoService", "EventAggregator")
export class TodoCreateViewModel extends PageViewModel {
    private readonly _todoService: TodoService;
    private readonly _eventAggregator: EventAggregator;
    private readonly _validator: Validator<this>;
    private _draftTitle: string = "";
    private _draftDescription: string = "";
    private _isSubmitting: boolean = false;

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

    public get isSubmitting(): boolean {
        return this._isSubmitting;
    }

    public get hasErrors(): boolean {
        return this._validator.hasErrors;
    }
    public get errors(): Record<keyof TodoCreateViewModel, string | undefined> {
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

    public async submitDraft(): Promise<void> {
        this._validator.enable();
        if (this._validator.hasErrors) return;

        const title = this._draftTitle.trim();
        const description = this._draftDescription.trim();

        this._isSubmitting = true;

        try {
            await this._todoService.create(
                title,
                description.length > 0 ? description : undefined,
            );
            this._eventAggregator.publish(TodoEvents.changed);
            this.runAfterAwait(() => {
                this._draftTitle = "";
                this._draftDescription = "";
                this._isSubmitting = false;
            });
            this.goTo(Routes.todoList);
        } catch (err) {
            const { message } = ErrorHelper.resolveErrorMessage(err);
            alert(message);

            this.runAfterAwait(() => {
                this._isSubmitting = false;
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
