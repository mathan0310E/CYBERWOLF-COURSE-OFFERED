import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/lib/consent";
import { useLegal } from "@/lib/legal";

/**
 * First-visit cookie notice. Shown until the visitor records a decision; the
 * decision is kept in local storage. This site sets no non-essential cookies,
 * so both actions are equivalent in effect (and we say so honestly).
 */
export function CookieBanner() {
  const { decided, acceptAll, essentialOnly } = useConsent();
  const { open } = useLegal();

  if (decided) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4"
    >
      <div className="mx-auto flex max-w-[1180px] flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-lift md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="max-w-2xl text-sm text-muted">
            We use only essential browser storage to run this site — mainly to remember this choice. We set no
            advertising or tracking cookies. See our{" "}
            <button type="button" onClick={() => open("cookies")} className="font-medium text-ink underline underline-offset-2">
              Cookie Policy
            </button>{" "}
            and{" "}
            <button type="button" onClick={() => open("privacy")} className="font-medium text-ink underline underline-offset-2">
              Privacy Policy
            </button>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-2 md:pl-4">
          <Button variant="outline" size="sm" onClick={essentialOnly}>
            Essential only
          </Button>
          <Button size="sm" onClick={acceptAll}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
