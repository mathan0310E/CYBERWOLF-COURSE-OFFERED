import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import {
  formatINR,
  ORIGINAL_PRICE_PER_COURSE,
  SINGLE_COURSE_OFFER_PRICE,
  TWO_COURSE_BUNDLE_PRICE,
} from "@cyberwolf/pricing";
import { Section } from "@/components/home/section";
import { cn } from "@/lib/utils";

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

interface PlanProps {
  title: string;
  badge?: string;
  price: number;
  original: number;
  saving: number;
  features: string[];
  cta: string;
  featured?: boolean;
}

function Plan({ title, badge, price, original, saving, features, cta, featured }: PlanProps) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-[18px] bg-card p-8",
        featured ? "shadow-lift ring-2 ring-apple-blue" : "shadow-card",
      )}
    >
      {badge && (
        <span className="absolute -top-3 left-8 rounded-pill bg-apple-blue px-3 py-1 text-xs font-medium text-white">
          {badge}
        </span>
      )}
      <h3 className="font-display text-[21px] font-semibold">{title}</h3>
      <p className="mt-6 flex items-baseline gap-3">
        <span className="font-display text-[40px] font-semibold leading-none tracking-tight-apple">
          {formatINR(price)}
        </span>
        <span className="text-[15px] text-muted line-through">{formatINR(original)}</span>
      </p>
      <p className="mt-2 text-[14px] text-apple-blue">You save {formatINR(saving)}</p>
      <ul className="mt-6 flex-1 space-y-3 text-[15px] text-muted">
        {features.map((line) => (
          <li key={line} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-apple-blue" aria-hidden="true" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/enroll"
        className={cn(
          "mt-8 inline-flex w-full items-center justify-center rounded-pill px-6 py-2.5 text-[15px] transition-colors",
          featured
            ? "bg-apple-blue text-white hover:bg-apple-blue-hover"
            : "border border-apple-blue text-apple-blue hover:bg-apple-blue/5",
        )}
      >
        {cta}
      </Link>
    </div>
  );
}

/** Pricing — a main-page section with the single-course and two-course offers. */
export function PricingSection() {
  return (
    <Section
      id="pricing"
      headingId="pricing-heading"
      eyebrow="Pricing"
      title="Simple, transparent pricing"
      description="Choose a single course or bundle two. Prices are confirmed on the server when your registration is received."
      className="bg-background-secondary"
    >
      <div className="grid items-stretch gap-5 md:grid-cols-2">
        <Plan
          title="Single course"
          badge="Offer"
          price={SINGLE_COURSE_OFFER_PRICE}
          original={ORIGINAL_PRICE_PER_COURSE}
          saving={SINGLE_SAVING}
          features={SINGLE_FEATURES}
          cta="Enroll with one course"
        />
        <Plan
          title="Two-course bundle"
          badge="Best value"
          price={TWO_COURSE_BUNDLE_PRICE}
          original={BUNDLE_ORIGINAL}
          saving={BUNDLE_SAVING}
          features={BUNDLE_FEATURES}
          cta="Enroll with two courses"
          featured
        />
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted">
        The bundle saving assumes {formatINR(ORIGINAL_PRICE_PER_COURSE)} as the original price for each individual
        course. Submitting a registration does not guarantee admission or payment.
      </p>
    </Section>
  );
}
