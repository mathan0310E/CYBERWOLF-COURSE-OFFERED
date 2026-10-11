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
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={cn("scroll-mt-24", className)}>
      <div className="container py-20 md:py-24">
        <motion.header {...anim} className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2
            id={`${id}-heading`}
            className="font-display mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl"
          >
            {title}
          </h2>
          {description && <p className="mt-4 text-lg leading-relaxed text-muted">{description}</p>}
        </motion.header>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
