import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
/** Loading skeleton with a subtle shimmer; disabled under reduced motion. */
export function Skeleton({ className, ...props }) {
    return (_jsx("div", { className: cn("relative overflow-hidden rounded-md bg-background-secondary", "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent", className), "aria-hidden": "true", ...props }));
}
