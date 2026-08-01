import type { Todo, TodoService } from "@example/sdk";
import { describe, expect, it, vi } from "vitest";
import { TodoItemViewModel } from "../src/pages/todos/pages/todo-list/components/todo-item/todo-item-view-model.js";
import type { TodoListViewModel } from "../src/pages/todos/pages/todo-list/todo-list-view-model.js";

// Props reach a ComponentViewModel through the framework hook; in a unit test
// the seam is the protected retrieveProps() — override it with fixed props.
class TestableTodoItemViewModel extends TodoItemViewModel {
    protected override retrieveProps(): { todoId: string } {
        return { todoId: "tdo_test1" };
    }
}

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

function fakeList(): TodoListViewModel {
    return {
        completeTodo: vi.fn(() => Promise.resolve()),
        goTo: vi.fn(),
    } as unknown as TodoListViewModel;
}

function fakeTodoService(get: (id: string) => Promise<Todo>): TodoService {
    return {
        getAll: vi.fn(),
        get: vi.fn(get),
        create: vi.fn(),
    } as unknown as TodoService;
}

describe("TodoItemViewModel", () => {
    it("loads its todo from the props' todoId on init", async (): Promise<void> => {
        const todo = fakeTodo("tdo_test1", "A");
        const service = fakeTodoService(() => Promise.resolve(todo));
        const vm = new TestableTodoItemViewModel(fakeList(), service);

        await vm.init();

        expect(service.get).toHaveBeenCalledWith("tdo_test1");
        expect(vm.todo).toBe(todo);
        expect(vm.isLoading).toBe(false);
        expect(vm.error).toBeNull();
    });

    it("complete() delegates to the owning list VM and opens the completed dialog", async (): Promise<void> => {
        const todo = fakeTodo("tdo_test1", "A");
        const list = fakeList();
        const vm = new TestableTodoItemViewModel(
            list,
            fakeTodoService(() => Promise.resolve(todo)),
        );
        await vm.init();

        await vm.complete();

        expect(list.completeTodo).toHaveBeenCalledWith(todo);
        expect(vm.isCompleting).toBe(false);
        expect(vm.isCompletedMessageOpen).toBe(true);

        vm.dismissCompletedMessage();
        expect(vm.isCompletedMessageOpen).toBe(false);
    });

    it("openEdit() navigates via the owning list VM while the todo is active", async (): Promise<void> => {
        const todo = fakeTodo("tdo_test1", "A");
        const list = fakeList();
        const vm = new TestableTodoItemViewModel(
            list,
            fakeTodoService(() => Promise.resolve(todo)),
        );
        await vm.init();

        vm.openEdit();

        expect(list.goTo).toHaveBeenCalledOnce();
    });
});
