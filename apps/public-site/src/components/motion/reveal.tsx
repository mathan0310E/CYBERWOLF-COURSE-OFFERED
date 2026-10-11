import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSET: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 26 },
  down: { x: 0, y: -26 },
  left: { x: 32, y: 0 },
  right: { x: -32, y: 0 },
  none: { x: 0, y: 0 },
};

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Direction the element travels from as it reveals. */
  from?: Direction;
  /** Seconds to wait before starting. */
  delay?: number;
  /** Total reveal duration in seconds. */
  duration?: number;
  /** Fraction of the element that must be visible before revealing. */
  amount?: number;
  once?: boolean;
  as?: "div" | "section" | "li" | "span" | "article" | "header" | "footer";
}

/**
 * Scroll-reveal wrapper. Elements fade + slide in once they enter the viewport.
 * Fully honours `prefers-reduced-motion` by rendering the final state directly.
 */
export function Reveal({
  children,
  className,
  from = "up",
  delay = 0,
  duration = 0.6,
  amount = 0.25,
  once = true,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const offset = OFFSET[from];
  const Comp = motion[as];

  if (reduce) {
    return <Comp className={className}>{children}</Comp>;
  }

  return (
    <Comp
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}

/** Parent that staggers its `RevealItem` children as they enter the viewport. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  amount = 0.2,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
  as?: "div" | "ul" | "ol";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];

  if (reduce) {
    return <Comp className={className}>{children}</Comp>;
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger } },
  };

  return (
    <Comp
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </Comp>
  );
}

/** A single child of `RevealGroup`. */
export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];

  if (reduce) {
    return <Comp className={className}>{children}</Comp>;
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <Comp className={cn(className)} variants={item}>
      {children}
    </Comp>
  );
}
