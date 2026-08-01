import {
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@example/common";
import { useComponentViewModel } from "@nivinjoseph/n-app";
import { Pencil } from "lucide-react";
import { observer } from "mobx-react-lite";
import type { JSX } from "react";
import { TodoItemViewModel } from "./todo-item-view-model.js";

export const TodoItem = observer(function TodoItem({
    todoId,
}: {
    todoId: string;
}): JSX.Element | null {
    const { vm } = useComponentViewModel(TodoItemViewModel, { todoId });

    const todo = vm.todo;
    if (todo === null) return null;

    return (
        <>
            <li className="group flex min-h-14 items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/60">
                <Checkbox
                    checked={todo.isCompleted}
                    disabled={todo.isCompleted || vm.isCompleting}
                    onCheckedChange={() => {
                        void vm.complete();
                    }}
                    aria-label={`Mark "${todo.title}" complete`}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                    <span
                        className={
                            todo.isCompleted
                                ? "text-sm text-foreground line-through opacity-40"
                                : "text-sm text-foreground"
                        }
                    >
                        {todo.title}
                    </span>
                    {todo.description !== null && (
                        <span
                            className={
                                todo.isCompleted
                                    ? "text-xs text-muted-foreground line-through opacity-40"
                                    : "text-xs text-muted-foreground"
                            }
                        >
                            {todo.description}
                        </span>
                    )}
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={vm.todo?.isCompleted}
                    onClick={() => {
                        vm.openEdit();
                    }}
                    aria-label={`Edit "${todo.title}"`}
                    className="transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
            </li>

            <Dialog
                open={vm.isCompletedMessageOpen}
                onOpenChange={(open) => {
                    if (!open) vm.dismissCompletedMessage();
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Todo completed</DialogTitle>
                        <DialogDescription>
                            “{todo.title}” has been marked complete. Nice work.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => {
                                vm.dismissCompletedMessage();
                            }}
                        >
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
});
