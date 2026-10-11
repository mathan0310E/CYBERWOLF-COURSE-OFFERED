import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Gradient call-to-action banner closing the main page. */
export function CtaBanner() {
  return (
    <section className="container pb-24">
      <div className="cta-banner">
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Ready to start learning?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Submit a registration and our team will follow up using the contact details you provide. Registration
            submission does not guarantee admission or payment.
          </p>
          <Button asChild size="lg" className="mt-8 bg-white text-brand-green-dark shadow-soft hover:bg-white/90">
            <Link to="/enroll">
              Start your registration
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
