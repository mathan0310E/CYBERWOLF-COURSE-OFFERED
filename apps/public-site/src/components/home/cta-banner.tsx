import { Link } from "react-router-dom";
import { Reveal } from "@/components/motion/reveal";

/** Closing call-to-action band with a pastel tinted frame. */
export function CtaBanner() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="rounded-xl border border-border bg-sky px-8 py-14 text-center shadow-lift md:px-16">
          <p className="eyebrow">Ready</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-[34px] leading-[1.05] tracking-tight sm:text-[48px]">
            Ready to <span className="display-accent">start learning</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
            Submit a registration and our team will follow up using the contact details you provide. Registration
            submission does not guarantee admission or payment.
          </p>
          <Link
            to="/enroll"
            data-arrow="true"
            className="mt-8 inline-flex items-center justify-center rounded-pill border border-border bg-ink px-8 py-3.5 text-[17px] font-semibold text-[#F5F2EB] transition-colors hover:bg-[#3A3A3A]"
          >
            Start your registration
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
