import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Cookie / storage consent.
 *
 * We store ONLY the visitor's consent decision in localStorage; no personal or
 * registration data is ever kept in browser storage (see the public-site notes).
 * The choice is required on first visit and can be changed later from the footer.
 */

const STORAGE_KEY = "cyberwolf360.cookieConsent.v1";

export type ConsentDecision = "accepted" | "essential";

export interface ConsentState {
  decision: ConsentDecision;
  /** ISO timestamp of when the decision was made. */
  decidedAt: string;
}

interface ConsentContextValue {
  /** null until the visitor has made a decision. */
  consent: ConsentState | null;
  /** True once a decision has been recorded (or was restored from storage). */
  decided: boolean;
  acceptAll: () => void;
  essentialOnly: () => void;
  /** Re-open the banner so the visitor can change their choice. */
  reset: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readStored(): ConsentState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.decision === "accepted" || parsed.decision === "essential") {
      return { decision: parsed.decision, decidedAt: parsed.decidedAt ?? new Date().toISOString() };
    }
    return null;
  } catch {
    // Corrupt or unavailable storage: fall back to treating it as undecided.
    return null;
  }
}

function writeStored(state: ConsentState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be blocked (private mode); the decision still applies for this session.
  }
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);

  // Restore a previous decision on mount (client-only).
  useEffect(() => {
    setConsent(readStored());
  }, []);

  const record = useCallback((decision: ConsentDecision) => {
    const state: ConsentState = { decision, decidedAt: new Date().toISOString() };
    writeStored(state);
    setConsent(state);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      decided: consent !== null,
      acceptAll: () => record("accepted"),
      essentialOnly: () => record("essential"),
      reset: () => setConsent(null),
    }),
    [consent, record],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within a ConsentProvider");
  return ctx;
}
