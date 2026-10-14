import { Lock, Code2, Sparkles, BookOpen } from "lucide-react";
import { Section } from "@/components/home/section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const REASONS = [
  {
    icon: Lock,
    title: "Security-first",
    body: "Build a defensive mindset and understand how modern systems are protected.",
    accent: "bg-sky",
  },
  {
    icon: Code2,
    title: "Practical focus",
    body: "Explore concepts you can apply to real projects and everyday workflows.",
    accent: "bg-butter",
  },
  {
    icon: Sparkles,
    title: "Modern topics",
    body: "Cover cybersecurity, ethical hacking, and AI & web development.",
    accent: "bg-lilac",
  },
  {
    icon: BookOpen,
    title: "Honest descriptions",
    body: "We publish general, truthful course copy — no invented syllabi or promises.",
    accent: "bg-sand",
  },
];

/** Why choose us — pastel value tiles. */
export function WhySection() {
  return (
    <Section
      id="why"
      eyebrow="Why CyberWolf"
      title="Learning that is practical and transparent"
      description="A focused set of technology courses with clear pricing and no exaggerated claims."
    >
      <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
        {REASONS.map((reason) => (
          <RevealItem key={reason.title} className="h-full">
            <div className="h-full rounded-lg border border-border bg-card p-7 shadow-card">
              <span
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg border border-border",
                  reason.accent,
                )}
              >
                <reason.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-[19px]">{reason.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{reason.body}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
