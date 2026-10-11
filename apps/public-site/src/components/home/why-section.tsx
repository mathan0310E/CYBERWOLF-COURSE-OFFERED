import { Lock, Code2, Sparkles, BookOpen } from "lucide-react";
import { Section } from "@/components/home/section";

const REASONS = [
  {
    icon: Lock,
    title: "Security-first",
    body: "Build a defensive mindset and understand how modern systems are protected.",
  },
  {
    icon: Code2,
    title: "Practical focus",
    body: "Explore concepts you can apply to real projects and everyday workflows.",
  },
  {
    icon: Sparkles,
    title: "Modern topics",
    body: "Cover cybersecurity, ethical hacking, and AI & web development.",
  },
  {
    icon: BookOpen,
    title: "Honest descriptions",
    body: "We publish general, truthful course copy — no invented syllabi or promises.",
  },
];

/** Why choose us — value cards. */
export function WhySection() {
  return (
    <Section
      id="why"
      eyebrow="Why CyberWolf 360"
      title="Learning that is practical and transparent"
      description="A focused set of technology courses with clear pricing and no exaggerated claims."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map((reason) => (
          <div
            key={reason.title}
            className="group h-full rounded-[20px] border border-border bg-card p-7 shadow-soft transition-transform duration-300 hover:-translate-y-1.5"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green-light text-brand-green-dark">
              <reason.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="font-display mt-5 text-lg font-bold">{reason.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{reason.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
