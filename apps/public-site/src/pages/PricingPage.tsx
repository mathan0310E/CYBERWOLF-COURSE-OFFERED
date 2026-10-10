import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import {
  formatINR,
  ORIGINAL_PRICE_PER_COURSE,
  SINGLE_COURSE_OFFER_PRICE,
  TWO_COURSE_BUNDLE_PRICE,
} from "@cyberwolf/pricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SINGLE_SAVING = ORIGINAL_PRICE_PER_COURSE - SINGLE_COURSE_OFFER_PRICE; // ₹3,500
const BUNDLE_ORIGINAL = ORIGINAL_PRICE_PER_COURSE * 2; // ₹24,000 (assumed)
const BUNDLE_SAVING = BUNDLE_ORIGINAL - TWO_COURSE_BUNDLE_PRICE; // ₹11,500 (assumed)

export function PricingPage() {
  return (
    <div className="container py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Pricing</h1>
        <p className="mt-3 text-muted">
          Choose a single course or bundle two. Prices are confirmed on the server when your registration is
          received.
        </p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Single course</CardTitle>
              <Badge>Offer</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-accent">{formatINR(SINGLE_COURSE_OFFER_PRICE)}</span>
              <span className="text-sm text-muted line-through">{formatINR(ORIGINAL_PRICE_PER_COURSE)}</span>
            </p>
            <p className="mt-1 text-sm text-secondary">You save {formatINR(SINGLE_SAVING)}</p>
            <ul className="mt-5 space-y-2 text-sm text-muted">
              {["Choose any one course", "Registration received and reviewed", "Transactional email confirmation"].map(
                (line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    <span>{line}</span>
                  </li>
                ),
              )}
            </ul>
            <Button asChild className="mt-6 w-full">
              <Link to="/enroll">Enroll with one course</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-secondary/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Two-course bundle</CardTitle>
              <Badge variant="secondary">Best value</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-accent">{formatINR(TWO_COURSE_BUNDLE_PRICE)}</span>
              <span className="text-sm text-muted line-through">{formatINR(BUNDLE_ORIGINAL)}</span>
            </p>
            <p className="mt-1 text-sm text-secondary">You save {formatINR(BUNDLE_SAVING)}</p>
            <ul className="mt-5 space-y-2 text-sm text-muted">
              {["Choose any two courses", "Registration received and reviewed", "Transactional email confirmation"].map(
                (line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    <span>{line}</span>
                  </li>
                ),
              )}
            </ul>
            <Button asChild variant="secondary" className="mt-6 w-full">
              <Link to="/enroll">Enroll with two courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted">
        The bundle saving assumes {formatINR(ORIGINAL_PRICE_PER_COURSE)} as the original price for each individual
        course. Submitting a registration does not guarantee admission or payment.
      </p>
    </div>
  );
}
