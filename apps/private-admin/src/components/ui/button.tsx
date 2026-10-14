import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Editorial pill button for the admin app (shares the public-site look). */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill border font-semibold tracking-[-0.01em] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default: "border-border bg-ink text-[#F5F2EB] hover:bg-[#3A3A3A]",
        secondary: "border-border bg-lilac text-ink hover:bg-[#d0b7f5]",
        accent: "border-border bg-butter text-ink hover:bg-[#ffe07a]",
        outline: "border-border bg-card text-ink hover:bg-background-secondary",
        ghost: "border-transparent bg-transparent text-ink hover:bg-ink/5",
        link: "border-transparent text-ink underline-offset-4 hover:underline",
        destructive: "border-border bg-destructive text-white hover:brightness-110",
      },
      size: {
        default: "h-10 px-4 text-sm",
        sm: "h-9 rounded-pill px-3.5 text-[13px]",
        lg: "h-11 rounded-pill px-6 text-base",
        icon: "h-10 w-10 rounded-full p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
