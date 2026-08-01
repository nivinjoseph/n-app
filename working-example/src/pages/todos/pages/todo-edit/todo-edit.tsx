import { Button, Input, Textarea } from "@example/common";
import { PageContext, usePageViewModel } from "@nivinjoseph/n-app";
import { ArrowLeft, Save } from "lucide-react";
import { observer } from "mobx-react-lite";
import type { JSX } from "react";
import { Routes } from "../../../../routes.js";
import { TodoEditViewModel } from "./todo-edit-view-model.js";

export const TodoEdit = observer(function TodoEditPage(): JSX.Element {
    const { vm, ctx } = usePageViewModel(TodoEditViewModel);

    return (
        <PageContext.Provider value={ctx}>
            <main className="mx-auto flex h-full max-w-2xl flex-col p-4 md:p-8">
                <header className="mb-6 flex items-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Back to list"
                        onClick={() => {
                            vm.goTo(Routes.todoList);
                        }}
                    >
                        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    <div>
                        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            Edit task
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Update the title or description.
                        </p>
                    </div>
                </header>

                {vm.isLoading && (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                )}

                {vm.isReady && (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            void vm.save();
                        }}
                        className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
                    >
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="todo-title"
                                className="text-sm font-medium"
                            >
                                Title{" "}
                                <span className="text-destructive">*</span>
                            </label>
                            <Input
                                id="todo-title"
                                value={vm.draftTitle}
                                onChange={(event) => {
                                    vm.draftTitle = event.target.value;
                                }}
                                placeholder="What needs doing?"
                                disabled={vm.isSaving}
                                aria-invalid={vm.errors.draftTitle != null}
                                aria-describedby={
                                    vm.errors.draftTitle != null
                                        ? "todo-title-error"
                                        : undefined
                                }
                                autoFocus
                            />
                            {vm.errors.draftTitle != null && (
                                <p
                                    id="todo-title-error"
                                    className="text-sm text-destructive"
                                >
                                    {vm.errors.draftTitle}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="todo-description"
                                className="text-sm font-medium"
                            >
                                Description{" "}
                                <span className="font-normal text-muted-foreground">
                                    (optional)
                                </span>
                            </label>
                            <Textarea
                                id="todo-description"
                                value={vm.draftDescription}
                                onChange={(event) => {
                                    vm.draftDescription = event.target.value;
                                }}
                                placeholder="Add more detail…"
                                disabled={vm.isSaving}
                                aria-invalid={
                                    vm.errors.draftDescription != null
                                }
                                aria-describedby={
                                    vm.errors.draftDescription != null
                                        ? "todo-description-error"
                                        : undefined
                                }
                            />
                            {vm.errors.draftDescription != null && (
                                <p
                                    id="todo-description-error"
                                    className="text-sm text-destructive"
                                >
                                    {vm.errors.draftDescription}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                disabled={vm.hasErrors || vm.isSaving}
                            >
                                <Save className="h-4 w-4" aria-hidden="true" />
                                Save
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    vm.goTo(Routes.todoList);
                                }}
                                disabled={vm.isSaving}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </main>
        </PageContext.Provider>
    );
});
