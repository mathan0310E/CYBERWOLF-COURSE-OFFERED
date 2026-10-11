import { createContext, useCallback, useContext, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { PrivacyContent } from "@/components/legal/privacy-content";
import { TermsContent } from "@/components/legal/terms-content";
import { CookieContent } from "@/components/legal/cookie-content";

/**
 * Legal documents (Privacy Policy, Terms of Service, Cookie Policy) open as
 * accessible dialogs on the single main page rather than as separate subpages.
 */

export type LegalKind = "privacy" | "terms" | "cookies";

const TITLES: Record<LegalKind, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  cookies: "Cookie Policy",
};

interface LegalContextValue {
  kind: LegalKind | null;
  open: (kind: LegalKind) => void;
  close: () => void;
}

const LegalContext = createContext<LegalContextValue | null>(null);

export function LegalProvider({ children }: { children: React.ReactNode }) {
  const [kind, setKind] = useState<LegalKind | null>(null);

  const open = useCallback((next: LegalKind) => setKind(next), []);
  const close = useCallback(() => setKind(null), []);

  const value = useMemo<LegalContextValue>(() => ({ kind, open, close }), [kind, open, close]);

  return (
    <LegalContext.Provider value={value}>
      {children}
      <Dialog.Root open={kind !== null} onOpenChange={(isOpen) => !isOpen && close()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85dvh] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-border bg-card shadow-card focus:outline-none data-[state=open]:animate-slide-up">
            <div className="flex items-start justify-between gap-4 border-b border-border/70 p-5">
              <Dialog.Title className="text-lg font-bold tracking-tight text-foreground">
                {kind ? TITLES[kind] : ""}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-background-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/35"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>
            <div className="overflow-y-auto p-5 text-sm leading-relaxed text-muted">
              {kind === "privacy" && <PrivacyContent />}
              {kind === "terms" && <TermsContent />}
              {kind === "cookies" && <CookieContent />}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </LegalContext.Provider>
  );
}

export function useLegal(): LegalContextValue {
  const ctx = useContext(LegalContext);
  if (!ctx) throw new Error("useLegal must be used within a LegalProvider");
  return ctx;
}
