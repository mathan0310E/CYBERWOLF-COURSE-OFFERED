import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill border px-2.5 py-0.5 text-xs font-semibold tracking-[-0.01em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-sky text-ink",
        secondary: "border-border bg-lilac text-ink",
        accent: "border-border bg-butter text-ink",
        outline: "border-border bg-card text-muted",
        destructive: "border-border bg-destructive text-white",
        success: "border-border bg-[#C8E6C9] text-ink",
        warning: "border-border bg-[#FFE0B2] text-ink",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
