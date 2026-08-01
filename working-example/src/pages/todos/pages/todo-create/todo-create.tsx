import { Button, Input, Textarea } from "@example/common";
import { PageContext, usePageViewModel } from "@nivinjoseph/n-app";
import { Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import type { JSX } from "react";
import { TodoCreateViewModel } from "./todo-create-view-model.js";

export const TodoCreate = observer(function TodoCreatePage(): JSX.Element {
    const { vm, ctx } = usePageViewModel(TodoCreateViewModel);

    return (
        <PageContext.Provider value={ctx}>
            <section className="mx-auto max-w-2xl p-4 md:p-8">
                <header className="mb-6">
                    <h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        <Plus className="h-7 w-7" aria-hidden="true" />
                        Create task
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Add a new item to the list.
                    </p>
                </header>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        void vm.submitDraft();
                    }}
                    className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="todo-title"
                            className="text-sm font-medium"
                        >
                            Title <span className="text-destructive">*</span>
                        </label>
                        <Input
                            id="todo-title"
                            value={vm.draftTitle}
                            onChange={(event) => {
                                vm.draftTitle = event.target.value;
                            }}
                            placeholder="What needs doing?"
                            disabled={vm.isSubmitting}
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
                            disabled={vm.isSubmitting}
                            aria-invalid={vm.errors.draftDescription != null}
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

                    <div>
                        <Button
                            type="submit"
                            disabled={vm.hasErrors || vm.isSubmitting}
                        >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Add
                        </Button>
                    </div>
                </form>
            </section>
        </PageContext.Provider>
    );
});
