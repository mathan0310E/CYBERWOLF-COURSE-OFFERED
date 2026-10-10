import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50", {
    variants: {
        variant: {
            default: "bg-accent text-primary-foreground hover:bg-accent/90",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
            outline: "border border-border bg-transparent text-foreground hover:bg-background-secondary hover:border-accent/40",
            ghost: "bg-transparent text-foreground hover:bg-background-secondary",
            link: "text-accent underline-offset-4 hover:underline",
        },
        size: {
            default: "h-11 px-5 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-12 rounded-md px-8 text-base",
            icon: "h-10 w-10",
        },
    },
    defaultVariants: { variant: "default", size: "default" },
});
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return _jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref: ref, ...props });
});
Button.displayName = "Button";
export { Button, buttonVariants };
