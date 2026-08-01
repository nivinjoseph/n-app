import type { Todo } from "./todo.js";

export interface TodoService {
    getAll(): Promise<Array<Todo>>;
    get(id: string): Promise<Todo>;

    create(title: string, description?: string): Promise<Todo>;
}
