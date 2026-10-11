import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/** Call-to-action band closing the main page — Apple's #F5F5F7 tile treatment. */
export function CtaBanner() {
  return (
    <section className="bg-background-secondary py-16 md:py-24">
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[32px] font-semibold leading-[1.1] tracking-tight-apple sm:text-[40px]">
            Ready to start learning?
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            Submit a registration and our team will follow up using the contact details you provide. Registration
            submission does not guarantee admission or payment.
          </p>
          <Link
            to="/enroll"
            className="mt-8 inline-flex items-center gap-2 rounded-pill bg-apple-blue px-6 py-3 text-[17px] text-white transition-colors hover:bg-apple-blue-hover"
          >
            Start your registration
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
