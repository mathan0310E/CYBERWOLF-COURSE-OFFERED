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
    >
      <ol className="grid gap-5 md:grid-cols-3">
        {STEPS.map((item) => (
          <li key={item.step} className="h-full rounded-[18px] bg-card p-7 shadow-card">
            <span className="font-display text-[32px] font-semibold leading-none text-apple-blue/25" aria-hidden="true">
              {item.step}
            </span>
            <h3 className="font-display mt-3 text-[17px] font-semibold">{item.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{item.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
