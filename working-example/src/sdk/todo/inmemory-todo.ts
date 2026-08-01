import { given } from "@nivinjoseph/n-defensive";
import type { Todo } from "./todo.js";

export class InMemoryTodo implements Todo {
    private readonly _id: string;
    private _title: string;
    private _description: string | null;
    private _isCompleted: boolean;

    public get id(): string {
        return this._id;
    }

    public get title(): string {
        return this._title;
    }

    public get description(): string | null {
        return this._description;
    }

    public get isCompleted(): boolean {
        return this._isCompleted;
    }

    public constructor(
        id: string,
        title: string,
        description: string | null = null,
        isCompleted: boolean = false,
    ) {
        given(id, "id").ensureHasValue().ensureIsString();
        this._id = id.trim();

        given(title, "title").ensureHasValue().ensureIsString();
        this._title = title.trim();

        given(description, "description").ensureIsString();
        this._description = description?.isNotEmptyOrWhiteSpace()
            ? description.trim()
            : null;

        given(isCompleted, "isCompleted").ensureHasValue().ensureIsBoolean();
        this._isCompleted = isCompleted;
    }

    public async updateTitle(title: string): Promise<void> {
        given(title, "title").ensureHasValue().ensureIsString();
        given(this, "this").ensure(
            (t) => !t.isCompleted,
            "must not be complete",
        );

        this._title = title.trim();
    }

    public async updateDescription(description: string | null): Promise<void> {
        given(description, "description").ensureIsString();
        given(this, "this").ensure(
            (t) => !t.isCompleted,
            "must not be complete",
        );

        this._description = description?.isNotEmptyOrWhiteSpace()
            ? description.trim()
            : null;
    }

    public async complete(): Promise<void> {
        this._isCompleted = true;
    }
}
