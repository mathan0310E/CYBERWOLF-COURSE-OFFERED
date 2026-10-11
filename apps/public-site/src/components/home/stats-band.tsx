import {
  formatINR,
  ORIGINAL_PRICE_PER_COURSE,
  SINGLE_COURSE_OFFER_PRICE,
  TWO_COURSE_BUNDLE_PRICE,
} from "@cyberwolf/pricing";

const STATS = [
  { value: "3", label: "Courses on offer" },
  { value: "2", label: "Courses per registration" },
  { value: formatINR(SINGLE_COURSE_OFFER_PRICE), label: `Single course (was ${formatINR(ORIGINAL_PRICE_PER_COURSE)})` },
  { value: formatINR(TWO_COURSE_BUNDLE_PRICE), label: "Two-course bundle" },
];

/**
 * Neutral stat band on Apple's `#F5F5F7` surface. Every figure is a real,
 * verifiable fact about the offer — no invented registration counts or urgency.
 */
export function StatsBand() {
  return (
    <section className="bg-background-secondary py-12 md:py-16">
      <div className="mx-auto grid max-w-[1024px] grid-cols-2 gap-y-10 px-6 md:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-[40px] font-semibold leading-none tracking-tight-apple sm:text-[48px]">
              {stat.value}
            </p>
            <p className="mx-auto mt-3 max-w-[14rem] text-[12px] leading-snug text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
