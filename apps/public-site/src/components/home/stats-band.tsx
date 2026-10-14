import {
  formatINR,
  ORIGINAL_PRICE_PER_COURSE,
  SINGLE_COURSE_OFFER_PRICE,
  TWO_COURSE_BUNDLE_PRICE,
} from "@cyberwolf/pricing";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";

const STATS = [
  { value: 3, label: "Courses on offer", prefix: "", suffix: "" },
  { value: 2, label: "Courses per registration", prefix: "", suffix: "" },
  {
    value: SINGLE_COURSE_OFFER_PRICE,
    label: `Single course (was ${formatINR(ORIGINAL_PRICE_PER_COURSE)})`,
    prefix: "₹",
    suffix: "",
  },
  { value: TWO_COURSE_BUNDLE_PRICE, label: "Two-course bundle", prefix: "₹", suffix: "" },
];

/**
 * Stat band. Every figure is a real, verifiable fact about the offer — no
 * invented registration counts or urgency. Numbers count up on scroll-in.
 */
export function StatsBand() {
  return (
    <section className="border-y border-border bg-card py-12 md:py-16">
      <RevealGroup className="mx-auto grid max-w-[1180px] grid-cols-2 gap-y-10 px-6 md:grid-cols-4">
        {STATS.map((stat) => (
          <RevealItem key={stat.label} className="text-center">
            <p className="font-display text-[40px] leading-none tracking-tight sm:text-[54px]">
              <CountUp to={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
            </p>
            <p className="mx-auto mt-3 max-w-[14rem] text-[12px] leading-snug text-muted">{stat.label}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
