import { AlertTriangle } from "lucide-react";
import type { JSX } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";

export function ErrorFallback(): JSX.Element {
    const error = useRouteError();

    const title = isRouteErrorResponse(error)
        ? `${error.status} ${error.statusText}`
        : "Something went wrong";

    const message =
        error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "An unexpected error occurred.";

    return (
        <section className="mx-auto max-w-2xl p-4 md:p-8">
            <div
                role="alert"
                className="rounded-xl border border-destructive bg-destructive/10 px-4 py-3"
            >
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-destructive">
                    <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                    {title}
                </h2>
                <p className="mt-2 text-sm text-destructive">{message}</p>
            </div>
        </section>
    );
}
