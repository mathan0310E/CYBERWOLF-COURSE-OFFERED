import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-md border border-input bg-background-secondary px-3 py-2 text-sm text-foreground",
      "placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
      "focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
      "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/40",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[100px] w-full rounded-md border border-input bg-background-secondary px-3 py-2 text-sm text-foreground",
        "placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/40",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-md border border-input bg-background-secondary px-3 py-2 text-sm text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
      "focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
      "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/40",
      className,
    )}
    {...props}
  />
));
Select.displayName = "Select";

export { Input, Textarea, Select };
