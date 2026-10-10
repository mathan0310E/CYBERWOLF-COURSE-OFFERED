import { jsx as _jsx } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors", {
    variants: {
        variant: {
            default: "border-accent/30 bg-accent/10 text-accent",
            secondary: "border-secondary/30 bg-secondary/10 text-secondary",
            outline: "border-border text-muted",
            destructive: "border-destructive/40 bg-destructive/10 text-destructive",
        },
    },
    defaultVariants: { variant: "default" },
});
export function Badge({ className, variant, ...props }) {
    return _jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
export { badgeVariants };
