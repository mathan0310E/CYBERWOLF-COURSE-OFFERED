import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "@/lib/utils";
const Input = React.forwardRef(({ className, type, ...props }, ref) => (_jsx("input", { type: type, ref: ref, className: cn("flex h-11 w-full rounded-md border border-input bg-background-secondary px-3 py-2 text-sm text-foreground", "placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent", "focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60", "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/40", className), ...props })));
Input.displayName = "Input";
const Textarea = React.forwardRef(({ className, ...props }, ref) => (_jsx("textarea", { ref: ref, className: cn("flex min-h-[100px] w-full rounded-md border border-input bg-background-secondary px-3 py-2 text-sm text-foreground", "placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent", "focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60", "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/40", className), ...props })));
Textarea.displayName = "Textarea";
export { Input, Textarea };
