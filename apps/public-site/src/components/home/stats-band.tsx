import { formatINR, ORIGINAL_PRICE_PER_COURSE, SINGLE_COURSE_OFFER_PRICE, TWO_COURSE_BUNDLE_PRICE } from "@cyberwolf/pricing";

const STATS = [
  { value: "3", label: "Courses on offer" },
  { value: "2", label: "Courses per registration" },
  { value: formatINR(SINGLE_COURSE_OFFER_PRICE), label: `Single course (was ${formatINR(ORIGINAL_PRICE_PER_COURSE)})` },
  { value: formatINR(TWO_COURSE_BUNDLE_PRICE), label: "Two-course bundle" },
];

/**
 * Green gradient stat band. Every figure is a real, verifiable fact about the
 * offer — no invented registration counts, ratings or urgency.
 */
export function StatsBand() {
  return (
    <section className="container pb-4">
      <div className="stats-band">
        <div className="relative grid grid-cols-2 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-4 py-10 text-center text-white md:py-11">
              <p className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{stat.value}</p>
              <p className="mt-2 text-sm font-medium text-white/85">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
