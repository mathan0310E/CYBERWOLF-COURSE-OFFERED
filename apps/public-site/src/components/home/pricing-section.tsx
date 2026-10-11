import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import {
  formatINR,
  ORIGINAL_PRICE_PER_COURSE,
  SINGLE_COURSE_OFFER_PRICE,
  TWO_COURSE_BUNDLE_PRICE,
} from "@cyberwolf/pricing";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/home/section";

const SINGLE_SAVING = ORIGINAL_PRICE_PER_COURSE - SINGLE_COURSE_OFFER_PRICE; // ₹3,500
const BUNDLE_ORIGINAL = ORIGINAL_PRICE_PER_COURSE * 2; // ₹24,000 (assumed)
const BUNDLE_SAVING = BUNDLE_ORIGINAL - TWO_COURSE_BUNDLE_PRICE; // ₹11,500 (assumed)

const SINGLE_FEATURES = [
  "Choose any one course",
  "Registration received and reviewed",
  "Transactional email confirmation",
];

const BUNDLE_FEATURES = [
  "Choose any two courses",
  "Registration received and reviewed",
  "Transactional email confirmation",
];

/** Pricing — a main-page section with the single-course and two-course offers. */
export function PricingSection() {
  return (
    <Section
      id="pricing"
      eyebrow="Pricing"
      title="Simple, transparent pricing"
      description="Choose a single course or bundle two. Prices are confirmed on the server when your registration is received."
    >
      <div className="grid items-stretch gap-6 md:grid-cols-2">
        <div className="flex h-full flex-col rounded-[24px] border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Single course</h3>
            <span className="rounded-full bg-brand-green-light px-3 py-1 text-xs font-semibold text-brand-green-dark">
              Offer
            </span>
          </div>
          <p className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-extrabold text-brand-green-dark">
              {formatINR(SINGLE_COURSE_OFFER_PRICE)}
            </span>
            <span className="text-sm text-muted line-through">{formatINR(ORIGINAL_PRICE_PER_COURSE)}</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-brand-green-dark">You save {formatINR(SINGLE_SAVING)}</p>
          <ul className="mt-6 space-y-3 text-sm text-muted">
            {SINGLE_FEATURES.map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-8 w-full">
            <Link to="/enroll">Enroll with one course</Link>
          </Button>
        </div>

        <div className="relative flex h-full flex-col rounded-[24px] border-2 border-brand-green bg-card p-8 shadow-lift">
          <span className="absolute -top-3 left-8 rounded-full bg-gradient-to-br from-brand-green to-brand-green-dark px-3 py-1 text-xs font-semibold text-white">
            Best value
          </span>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Two-course bundle</h3>
          </div>
          <p className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-extrabold text-brand-green-dark">
              {formatINR(TWO_COURSE_BUNDLE_PRICE)}
            </span>
            <span className="text-sm text-muted line-through">{formatINR(BUNDLE_ORIGINAL)}</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-brand-green-dark">You save {formatINR(BUNDLE_SAVING)}</p>
          <ul className="mt-6 space-y-3 text-sm text-muted">
            {BUNDLE_FEATURES.map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <Button asChild className="mt-8 w-full">
            <Link to="/enroll">Enroll with two courses</Link>
          </Button>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted">
        The bundle saving assumes {formatINR(ORIGINAL_PRICE_PER_COURSE)} as the original price for each individual
        course. Submitting a registration does not guarantee admission or payment.
      </p>
    </Section>
  );
}
