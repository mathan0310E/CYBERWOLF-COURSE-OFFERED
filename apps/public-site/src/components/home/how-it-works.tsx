import { Section } from "@/components/home/section";

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
      eyebrow="How it works"
      title="Three simple steps"
      description="From choosing a course to receiving your confirmation email."
      className="bg-background-secondary"
    >
      <ol className="grid gap-6 md:grid-cols-3">
        {STEPS.map((item) => (
          <li key={item.step} className="relative h-full rounded-[20px] border border-border bg-card p-7 shadow-soft">
            <span className="font-display text-4xl font-extrabold text-brand-green-light" aria-hidden="true">
              {item.step}
            </span>
            <h3 className="font-display mt-3 text-lg font-bold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
