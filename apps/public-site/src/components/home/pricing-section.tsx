import { Link } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import {
  formatINR,
  ORIGINAL_PRICE_PER_COURSE,
  SINGLE_COURSE_OFFER_PRICE,
  TWO_COURSE_BUNDLE_PRICE,
} from "@cyberwolf/pricing";
import { Section } from "@/components/home/section";
import { Reveal } from "@/components/motion/reveal";
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
        "edge-glow relative flex h-full flex-col rounded-[18px] border bg-card p-8 shadow-card",
        featured ? "border-neon/60 shadow-lift" : "border-border",
      )}
    >
      {badge && (
        <span
          className={cn(
            "absolute -top-3 left-8 rounded-pill px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider",
            featured ? "bg-neon text-[#04140A]" : "bg-emerald text-white",
          )}
        >
          {badge}
        </span>
      )}
      <h3 className="font-display text-[21px] font-semibold">{title}</h3>
      <p className="mt-6 flex items-baseline gap-3">
        <span className="font-display text-[42px] font-semibold leading-none tracking-tight">
          {formatINR(price)}
        </span>
        <span className="text-[15px] text-muted line-through">{formatINR(original)}</span>
      </p>
      <p className="mt-2 font-mono text-[13px] text-mint">you save {formatINR(saving)}</p>
      <ul className="mt-6 flex-1 space-y-3 text-[15px] text-muted">
        {features.map((line) => (
          <li key={line} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-neon" aria-hidden="true" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/enroll"
        className={cn(
          "mt-8 inline-flex w-full items-center justify-center rounded-pill px-6 py-2.5 text-[15px] transition-colors",
          featured
            ? "bg-neon text-[#04140A] hover:bg-neon/90"
            : "border border-neon/60 text-neon hover:bg-neon/10",
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
      eyebrow="// pricing"
      title="Simple, transparent pricing"
      description="Choose a single course or bundle two. Prices are confirmed on the server when your registration is received."
      className="bg-background-secondary"
    >
      <div className="grid items-stretch gap-5 md:grid-cols-2">
        <Reveal from="right">
          <Plan
            title="Single course"
            badge="Offer"
            price={SINGLE_COURSE_OFFER_PRICE}
            original={ORIGINAL_PRICE_PER_COURSE}
            saving={SINGLE_SAVING}
            features={SINGLE_FEATURES}
            cta="Enroll with one course"
          />
        </Reveal>
        <Reveal from="left" delay={0.1}>
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
        </Reveal>
      </div>

      <Reveal>
        <p className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 text-center text-xs text-muted">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-neon" aria-hidden="true" />
          The bundle saving assumes {formatINR(ORIGINAL_PRICE_PER_COURSE)} as the original price for each individual
          course. Submitting a registration does not guarantee admission or payment.
        </p>
      </Reveal>
    </Section>
  );
}
