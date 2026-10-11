import { cn } from "@/lib/utils";

/** Loading skeleton with a subtle shimmer; disabled under reduced motion. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[12px] bg-background-secondary",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
