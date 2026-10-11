import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CountUpProps {
  /** Final value. */
  to: number;
  /** Seconds for the full count. */
  duration?: number;
  prefix?: string;
  suffix?: string;
  /** Thousands separator for the integer part (e.g. 12,000). */
  separator?: string;
  className?: string;
}

/**
 * Counts a number up when it scrolls into view. Honours `prefers-reduced-motion`
 * by jumping straight to the final value.
 */
export function CountUp({
  to,
  duration = 1.6,
  prefix = "",
  suffix = "",
  separator = ",",
  className,
}: CountUpProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (reduce || !inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, to, duration]);

  const formatted = value.toLocaleString("en-IN", { useGrouping: Boolean(separator) });

  return (
    <span ref={ref} className={cn(className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
