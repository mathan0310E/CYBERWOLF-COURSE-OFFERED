import * as React from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "flex w-full rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60 " +
  "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input type={type} ref={ref} className={cn(fieldBase, "h-10 py-2", className)} {...props} />
));
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldBase, "min-h-[100px] py-2.5", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";

export { Input, Textarea };
