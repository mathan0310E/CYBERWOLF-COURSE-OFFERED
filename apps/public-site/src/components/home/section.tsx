import { cn } from "@/lib/utils";

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
 * Section shell with Apple's generous vertical rhythm (88–120px), a 1024px
 * content column, an optional blue eyebrow kicker and a tight display heading.
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
  return (
    <section id={id} className={cn("scroll-mt-24 py-16 md:py-24", className)}>
      <div className="mx-auto max-w-[1024px] px-6">
        {(eyebrow || title || description) && (
          <header className={cn("max-w-2xl", centered && "mx-auto text-center")}>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && (
              <h2
                id={headingId}
                className="font-display mt-3 text-[32px] font-semibold leading-[1.1] tracking-tight-apple sm:text-[40px]"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className={cn("mt-4 text-[17px] leading-relaxed text-muted", centered && "mx-auto")}>
                {description}
              </p>
            )}
          </header>
        )}
        <div className={cn((eyebrow || title || description) && "mt-12 md:mt-16")}>{children}</div>
      </div>
    </section>
  );
}
