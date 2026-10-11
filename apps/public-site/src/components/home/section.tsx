import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionProps {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "center" | "left";
  children: React.ReactNode;
}

/**
 * In-page section wrapper. Each top-level section on the single main page is an
 * anchor target (scroll-margin keeps the sticky header from covering headings)
 * and a labelled landmark for assistive technology.
 */
export function Section({ id, eyebrow, title, description, className, align = "center", children }: SectionProps) {
  const reduceMotion = useReducedMotion();
  const anim = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 12 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.4 } };

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={cn("scroll-mt-20 border-t border-border/70", className)}>
      <div className="container py-16 md:py-20">
        <motion.header {...anim} className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
          {eyebrow && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">{eyebrow}</p>
          )}
          <h2 id={`${id}-heading`} className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {description && <p className="mt-3 text-muted">{description}</p>}
        </motion.header>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
