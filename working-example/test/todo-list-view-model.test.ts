import type { Todo, TodoService } from "@example/sdk";
import type { EventAggregator } from "@nivinjoseph/n-app";
import { describe, expect, it, vi } from "vitest";
import { TodoEvents } from "../src/events.js";
import { TodoListViewModel } from "../src/pages/todos/pages/todo-list/todo-list-view-model.js";

function fakeTodo(id: string, title: string): Todo {
    return {
        id,
        title,
        description: null,
        isCompleted: false,
        updateTitle: vi.fn(),
        updateDescription: vi.fn(),
        complete: vi.fn(),
    };
}

function fakeTodoService(getAll: () => Promise<Array<Todo>>): TodoService {
    return {
        getAll: vi.fn(getAll),
        get: vi.fn(),
        create: vi.fn(),
    } as unknown as TodoService;
}

function fakeEventAggregator(): EventAggregator {
    return {
        publish: vi.fn(),
        subscribe: vi.fn(),
    } as unknown as EventAggregator;
}

describe("TodoListViewModel", () => {
    it("loads todos from the service on init", async (): Promise<void> => {
        const todos = [fakeTodo("tdo_1", "A"), fakeTodo("tdo_2", "B")];
        const service = fakeTodoService(() => Promise.resolve(todos));
        const vm = new TodoListViewModel(service, fakeEventAggregator());

        await vm.init();

        expect(vm.isLoading).toBe(false);
        expect(vm.error).toBeNull();
        expect(vm.todos).toEqual(todos);
    });

    it("completeTodo completes it, publishes the change, and reloads", async (): Promise<void> => {
        const todo = fakeTodo("tdo_1", "A");
        const service = fakeTodoService(() => Promise.resolve([]));
        const eventAggregator = fakeEventAggregator();
        const vm = new TodoListViewModel(service, eventAggregator);

        await vm.completeTodo(todo);

        expect(todo.complete).toHaveBeenCalledOnce();
        expect(eventAggregator.publish).toHaveBeenCalledWith(
            TodoEvents.changed,
        );
        // _load() runs after the mutation to refresh the list
        expect(service.getAll).toHaveBeenCalledOnce();
    });
});
