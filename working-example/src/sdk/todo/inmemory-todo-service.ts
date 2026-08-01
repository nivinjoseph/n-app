import { InMemoryTodo } from "./inmemory-todo.js";
import type { Todo } from "./todo.js";
import type { TodoService } from "./todo-service.js";

export class InMemoryTodoService implements TodoService {
    private readonly _todos: Map<string, Todo> = new Map();

    public async getAll(): Promise<Array<Todo>> {
        return [...this._todos.values()];
    }

    public async get(id: string): Promise<Todo> {
        const todo = this._todos.get(id);
        if (todo === undefined)
            throw new Error(`Todo with id '${id}' not found.`);

        return todo;
    }

    public async create(title: string, description?: string): Promise<Todo> {
        const todo = new InMemoryTodo(
            crypto.randomUUID(),
            title,
            description ?? null,
        );
        this._todos.set(todo.id, todo);

        return todo;
    }
}
