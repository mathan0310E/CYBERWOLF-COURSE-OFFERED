import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

/** Closing call-to-action band with a neon gradient frame. */
export function CtaBanner() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="grid-bg absolute inset-0 opacity-[0.2]" aria-hidden="true" />
      <div className="aurora left-[8%] top-[10%] h-72 w-72 bg-neon/20" aria-hidden="true" />
      <div className="aurora bottom-[6%] right-[6%] h-80 w-80 bg-violet/20" aria-hidden="true" />

      <div className="relative mx-auto max-w-[1180px] px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">// ready</p>
          <h2 className="font-display mt-4 text-[32px] font-semibold leading-[1.08] tracking-tight sm:text-[44px]">
            Ready to start learning?
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            Submit a registration and our team will follow up using the contact details you provide. Registration
            submission does not guarantee admission or payment.
          </p>
          <Link
            to="/enroll"
            className="glow-neon mt-8 inline-flex items-center gap-2 rounded-pill bg-neon px-7 py-3 text-[17px] font-medium text-[#04121A] transition-transform hover:scale-[1.03]"
          >
            Start your registration
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
