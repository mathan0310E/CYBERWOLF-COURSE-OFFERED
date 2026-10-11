import { Section } from "@/components/home/section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

const STEPS = [
  {
    step: "01",
    title: "Choose your courses",
    body: "Select one or two of the three courses. Your price preview updates as you choose.",
  },
  {
    step: "02",
    title: "Submit your details",
    body: "Complete the short registration form. The server recalculates and confirms your price.",
  },
  {
    step: "03",
    title: "Get your confirmation",
    body: "You receive a transactional email with your reference. Our team is notified and follows up.",
  },
];

/** How it works — three simple steps. */
export function HowItWorks() {
  return (
    <Section
      id="how"
      eyebrow="// how it works"
      title="Three simple steps"
      description="From choosing a course to receiving your confirmation email."
    >
      <RevealGroup as="ol" className="grid gap-5 md:grid-cols-3" stagger={0.12}>
        {STEPS.map((item) => (
          <RevealItem
            key={item.step}
            as="li"
            className="edge-glow h-full rounded-[18px] border border-border bg-card p-7 shadow-card"
          >
            <span
              className="font-display text-[34px] font-semibold leading-none text-gradient"
              aria-hidden="true"
            >
              {item.step}
            </span>
            <h3 className="font-display mt-4 text-[17px] font-semibold">{item.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{item.body}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
