import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../lib/utils.js";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    function Textarea({ className, rows = 4, ...props }, ref) {
        return (
            <textarea
                ref={ref}
                rows={rows}
                className={cn(
                    "flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...props}
            />
        );
    },
);
