export interface Todo {
    get id(): string;

    get title(): string;
    get description(): string | null;
    get isCompleted(): boolean;

    updateTitle(title: string): Promise<void>;
    updateDescription(description: string | null): Promise<void>;
    complete(): Promise<void>;
}
