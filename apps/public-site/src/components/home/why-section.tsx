import { Lock, Code2, Sparkles, BookOpen } from "lucide-react";
import { Section } from "@/components/home/section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

const REASONS = [
  {
    icon: Lock,
    title: "Security-first",
    body: "Build a defensive mindset and understand how modern systems are protected.",
    accent: "text-neon",
    ring: "glow-neon",
  },
  {
    icon: Code2,
    title: "Practical focus",
    body: "Explore concepts you can apply to real projects and everyday workflows.",
    accent: "text-violet",
    ring: "glow-violet",
  },
  {
    icon: Sparkles,
    title: "Modern topics",
    body: "Cover cybersecurity, ethical hacking, and AI & web development.",
    accent: "text-lime",
    ring: "glow-neon",
  },
  {
    icon: BookOpen,
    title: "Honest descriptions",
    body: "We publish general, truthful course copy — no invented syllabi or promises.",
    accent: "text-neon",
    ring: "glow-violet",
  },
];

/** Why choose us — neon value tiles. */
export function WhySection() {
  return (
    <Section
      id="why"
      eyebrow="// why cyberwolf"
      title="Learning that is practical and transparent"
      description="A focused set of technology courses with clear pricing and no exaggerated claims."
    >
      <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
        {REASONS.map((reason) => (
          <RevealItem key={reason.title} className="h-full">
            <div className="edge-glow h-full rounded-[18px] border border-border bg-card p-7 shadow-card">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-[12px] bg-background ${reason.ring} ${reason.accent}`}
              >
                <reason.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-display mt-5 text-[17px] font-semibold">{reason.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{reason.body}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
