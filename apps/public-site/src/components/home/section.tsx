import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  headingId?: string;
  align?: "center" | "left";
  className?: string;
  children: React.ReactNode;
}

/**
 * Section shell: generous vertical rhythm, a 1180px content column, an optional
 * monospaced neon kicker and a display heading that reveals on scroll.
 */
export function Section({
  id,
  eyebrow,
  title,
  description,
  headingId,
  align = "center",
  className,
  children,
}: SectionProps) {
  const centered = align === "center";
  const hasHeader = Boolean(eyebrow || title || description);

  return (
    <section id={id} className={cn("scroll-mt-24 py-16 md:py-24", className)}>
      <div className="mx-auto max-w-[1180px] px-6">
        {hasHeader && (
          <Reveal
            as="header"
            className={cn("max-w-2xl", centered && "mx-auto text-center")}
            from={centered ? "up" : "right"}
          >
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && (
              <h2
                id={headingId}
                className="font-display mt-4 text-[32px] font-semibold leading-[1.08] tracking-tight sm:text-[42px]"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className={cn("mt-4 text-[17px] leading-relaxed text-muted", centered && "mx-auto")}>
                {description}
              </p>
            )}
          </Reveal>
        )}
        <div className={cn(hasHeader && "mt-12 md:mt-16")}>{children}</div>
      </div>
    </section>
  );
}
