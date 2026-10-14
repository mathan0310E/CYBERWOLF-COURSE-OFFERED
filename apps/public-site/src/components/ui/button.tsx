import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Editorial pill button. Ink-outlined, softly rounded, with a small arrow glyph
 * that rotates on hover — the reference site's signature button motion.
 *
 * The arrow is injected via CSS (`data-arrow`), not markup, so `asChild` links
 * and buttons keep their existing accessible names.
 */
const buttonVariants = cva(
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill border font-semibold tracking-[-0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-45 data-[arrow=true]:pr-9",
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
        default: "h-10 px-5 text-[15px]",
        sm: "h-9 rounded-pill px-4 text-[13px]",
        lg: "h-12 rounded-pill px-7 text-[16px]",
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
