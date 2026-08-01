import { PageContext, Utils, usePageViewModel } from "@nivinjoseph/n-app";
import {
    Bell,
    FlaskConical,
    HelpCircle,
    ListTodo,
    Plus,
    Search,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import type { JSX } from "react";
import { NavLink, Outlet } from "react-router";
import { Routes } from "../../routes.js";
import { TodosViewModel } from "./todos-view-model.js";

export const Todos = observer(function AppShell(): JSX.Element {
    const { vm, ctx } = usePageViewModel(TodosViewModel);
    const initial = (vm.owner.charAt(0) || "U").toUpperCase();

    return (
        <PageContext.Provider value={ctx}>
            <div className="flex h-full">
                {/* Desktop sidebar — hidden on mobile in favour of the bottom tab bar */}
                <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-muted/60 py-6 md:flex">
                    <div className="mb-8 px-6">
                        <h1 className="font-display text-2xl font-bold tracking-tight text-primary">
                            TaskMaster
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {vm.owner}
                        </p>
                    </div>

                    <nav className="flex flex-1 flex-col gap-1 px-3">
                        <NavLink
                            to={Routes.todoList}
                            className={navItemClassName}
                        >
                            <ListTodo className="h-5 w-5" aria-hidden="true" />
                            Tasks
                        </NavLink>
                        <NavLink
                            to={Routes.todoCreate}
                            className={navItemClassName}
                        >
                            <Plus className="h-5 w-5" aria-hidden="true" />
                            Create
                        </NavLink>
                        <NavLink
                            to={Utils.generateUrl(Routes.scratch, {})}
                            className={navItemClassName}
                        >
                            <FlaskConical
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                            Scratch
                        </NavLink>
                    </nav>

                    <div className="mt-2 px-3">
                        <NavLink
                            to={Routes.todoCreate}
                            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                        >
                            <Plus className="h-5 w-5" aria-hidden="true" />
                            Quick Add
                        </NavLink>
                        <div className="mt-4 flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5">
                            <span
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                                aria-hidden="true"
                            >
                                {initial}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {vm.owner}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Pro Plan
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="flex flex-1 flex-col overflow-hidden">
                    {/* Mobile top bar — brand + actions (sidebar is hidden) */}
                    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:hidden">
                        <span className="font-display text-xl font-bold tracking-tight text-primary">
                            TaskMaster
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                aria-label="Notifications"
                                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                                <Bell className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <span
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                                aria-hidden="true"
                            >
                                {initial}
                            </span>
                        </div>
                    </header>

                    {/* Desktop top app bar — search + actions */}
                    <header className="hidden h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-6 md:flex">
                        <div className="relative w-full max-w-md">
                            <Search
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <input
                                type="search"
                                aria-label="Search tasks"
                                placeholder="Search tasks, tags, or focus sessions…"
                                className="h-10 w-full rounded-lg border-none bg-muted pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                aria-label="Notifications"
                                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                                <Bell className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                aria-label="Help"
                                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                                <HelpCircle
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                />
                            </button>
                        </div>
                    </header>

                    {!vm.isLoading && (
                        <div
                            role="status"
                            className={
                                vm.hasTodos
                                    ? "border-b border-border bg-muted/40 px-6 py-2.5 text-sm text-muted-foreground"
                                    : "border-b border-border bg-accent px-6 py-2.5 text-sm text-accent-foreground"
                            }
                        >
                            {vm.hasTodos
                                ? "Keep going — you're making progress!"
                                : "Get started by creating your first todo."}
                        </div>
                    )}
                    <div className="flex-1 overflow-auto bg-background">
                        <Outlet />
                    </div>

                    {/* Mobile bottom tab bar with a centre Quick-Add FAB */}
                    <nav className="flex h-16 shrink-0 items-center border-t border-border bg-background px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] md:hidden">
                        <NavLink
                            to={Routes.todoList}
                            className={bottomNavClassName}
                        >
                            <ListTodo className="h-5 w-5" aria-hidden="true" />
                            <span className="text-[10px] font-semibold">
                                Tasks
                            </span>
                        </NavLink>
                        <NavLink
                            to={Routes.todoCreate}
                            aria-label="Quick add task"
                            className="relative -top-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
                        >
                            <Plus className="h-7 w-7" aria-hidden="true" />
                        </NavLink>
                        <NavLink
                            to={Utils.generateUrl(Routes.scratch, {})}
                            className={bottomNavClassName}
                        >
                            <FlaskConical
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                            <span className="text-[10px] font-semibold">
                                Scratch
                            </span>
                        </NavLink>
                    </nav>
                </main>
            </div>
        </PageContext.Provider>
    );
});

function navItemClassName({ isActive }: { isActive: boolean }): string {
    const base =
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors";
    return isActive
        ? `${base} bg-accent font-semibold text-accent-foreground`
        : `${base} text-muted-foreground hover:bg-secondary hover:text-foreground`;
}

function bottomNavClassName({ isActive }: { isActive: boolean }): string {
    const base =
        "flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors";
    return isActive ? `${base} text-primary` : `${base} text-muted-foreground`;
}
