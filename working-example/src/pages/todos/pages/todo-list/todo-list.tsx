import { PageContext, usePageViewModel } from "@nivinjoseph/n-app";
import { ListTodo, Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import type { JSX } from "react";
import { NavLink } from "react-router";
import { Routes } from "../../../../routes.js";
import { TodoItem } from "./components/todo-item/todo-item.js";
import { TodoListViewModel } from "./todo-list-view-model.js";

export const TodoList = observer(function TodoListPage(): JSX.Element {
    const { vm, ctx } = usePageViewModel(TodoListViewModel);

    return (
        <PageContext.Provider value={ctx}>
            <section className="mx-auto max-w-3xl p-4 md:p-8">
                <header className="mb-6">
                    <h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        <ListTodo className="h-7 w-7" aria-hidden="true" />
                        Tasks
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Backed by the in-memory SDK service.
                    </p>
                </header>

                {vm.error !== null && (
                    <div
                        role="alert"
                        className="mb-4 rounded-lg border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    >
                        {vm.error}
                    </div>
                )}

                {vm.todos.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card py-16 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                            <ListTodo className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <p className="text-sm text-muted-foreground">
                            {vm.isLoading
                                ? "Loading…"
                                : "No tasks yet. Stay focused — add your first one."}
                        </p>
                        {!vm.isLoading && (
                            <NavLink
                                to={Routes.todoCreate}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                            >
                                <Plus className="h-5 w-5" aria-hidden="true" />
                                Add your first task
                            </NavLink>
                        )}
                    </div>
                ) : (
                    <div className="rounded-xl border border-border bg-card p-2 shadow-sm">
                        <ul className="flex flex-col gap-0.5">
                            {vm.todos.map((todo) => (
                                <TodoItem key={todo.id} todoId={todo.id} />
                            ))}
                        </ul>
                    </div>
                )}
            </section>
        </PageContext.Provider>
    );
});
