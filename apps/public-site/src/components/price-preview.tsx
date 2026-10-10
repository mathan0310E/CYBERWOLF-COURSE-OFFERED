import { calculatePrice, formatINR, isSubmittable } from "@cyberwolf/pricing";
import type { CourseId } from "@cyberwolf/shared-types";
import { CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PricePreviewProps {
  courseIds: CourseId[];
  /** Compact layout for the enrollment sidebar. */
  compact?: boolean;
}

/**
 * Client-side price preview. The authoritative price is always recalculated by
 * the trusted backend; this is shown for user feedback only.
 */
export function PricePreview({ courseIds, compact = false }: PricePreviewProps) {
  const price = calculatePrice(courseIds);
  const submittable = isSubmittable(courseIds);

  return (
    <Card>
      <CardHeader className={compact ? "p-5 pb-2" : undefined}>
        <div className="flex items-center justify-between">
          <CardTitle>Your price</CardTitle>
          {price.courseCount > 0 && <Badge variant="secondary">{price.courseCount} course{price.courseCount > 1 ? "s" : ""}</Badge>}
        </div>
      </CardHeader>
      <CardContent className={compact ? "p-5 pt-0" : undefined}>
        {price.courseCount === 0 ? (
          <div className="flex items-start gap-2 text-sm text-muted">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>Select one or two courses to see your price.</p>
          </div>
        ) : (
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">Original price</dt>
              <dd className="text-muted line-through">{formatINR(price.originalPrice)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">You save</dt>
              <dd className="font-medium text-secondary">{formatINR(price.discount)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border/70 pt-2">
              <dt className="font-semibold text-foreground">Final price</dt>
              <dd className="text-xl font-bold text-accent">{formatINR(price.finalPrice)}</dd>
            </div>
          </dl>
        )}

        <p className="mt-3 flex items-start gap-2 text-xs text-muted">
          {submittable && price.courseCount > 0 && (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
          )}
          <span>
            Prices are confirmed on the server when your registration is received. Selecting courses does not
            confirm admission or payment.
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
