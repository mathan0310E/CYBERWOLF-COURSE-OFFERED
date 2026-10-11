import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPANY, COMPANY_ADDRESS_LINE } from "@cyberwolf/shared-types";
import { CompanyWordmark } from "@/components/brand";
import { SocialLinks } from "@/components/social-links";
import { CookieBanner } from "@/components/cookie-banner";
import { useConsent } from "@/lib/consent";
import { useLegal } from "@/lib/legal";

/**
 * Site chrome for the futuristic redesign: a slim translucent top bar with a
 * neon underline, a single Enroll CTA, and a directory footer.
 *
 * The former "CyberWolf 360 Store" sub-bar and its Courses/Pricing/About/FAQ
 * links have been removed. Those anchors still exist on the home page (so
 * in-page links and deep links keep working), but they are no longer surfaced
 * as navigation.
 */

function BrandMark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onNavigate}
      className="flex items-center gap-2 rounded-sm px-1 py-1 text-[15px] font-semibold text-foreground"
      aria-label="CyberWolf 360 home"
    >
      <CompanyWordmark className="h-6 w-6" />
      <span className="font-display tracking-tight">
        CyberWolf<span className="text-neon">360</span>
      </span>
    </Link>
  );
}

export function Layout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { open: openLegal } = useLegal();
  const { consent, reset: resetConsent } = useConsent();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-pill focus:bg-neon focus:px-4 focus:py-2 focus:text-sm focus:text-[#04121A]"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-50">
        <nav
          aria-label="Primary"
          className={cn(
            "transition-colors duration-300",
            scrolled
              ? "border-b border-border/80 bg-background/80 backdrop-blur-xl"
              : "border-b border-transparent bg-background/50 backdrop-blur-md",
          )}
        >
          <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-6 px-6">
            <BrandMark />

            <div className="flex items-center gap-3">
              <Link
                to="/enroll"
                className="glow-neon hidden rounded-pill bg-neon px-4 py-2 text-[14px] font-medium text-[#04121A] transition-transform hover:scale-[1.04] sm:inline-block"
              >
                Enroll Now
              </Link>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="rounded-sm p-1 text-foreground md:hidden"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Neon hairline that lights up once scrolled. */}
          <div
            className={cn(
              "h-px w-full bg-gradient-to-r from-transparent via-neon/60 to-transparent transition-opacity duration-300",
              scrolled ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          />
        </nav>

        {open && (
          <div
            id="mobile-menu"
            className="border-b border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <ul className="mx-auto max-w-[1180px] px-6 py-3">
              <li>
                <Link
                  to="/enroll"
                  onClick={() => setOpen(false)}
                  className="block rounded-pill bg-neon px-4 py-2.5 text-center text-[15px] font-medium text-[#04121A]"
                >
                  Enroll Now
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      <main id="main" className="flex-1 pt-16">
        <Outlet />
      </main>

      <footer className="relative border-t border-border bg-background-secondary text-muted" role="contentinfo">
        <div className="grid-bg absolute inset-0 opacity-[0.12]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1180px] px-6 py-12">
          <div className="grid gap-8 md:grid-cols-[2fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2">
                <CompanyWordmark className="h-6 w-6" />
                <span className="font-display text-[15px] font-semibold text-foreground">
                  CyberWolf<span className="text-neon">360</span>
                </span>
              </div>
              <p className="mt-3 max-w-sm text-[13px] leading-relaxed">
                {COMPANY.servicesTagline}. {COMPANY.tagline} Registration submission does not
                guarantee admission or payment.
              </p>
              <div className="mt-4">
                <SocialLinks />
              </div>
            </div>

            <nav aria-label="Legal">
              <h2 className="font-mono text-[12px] uppercase tracking-widest text-neon">Legal</h2>
              <ul className="mt-3 space-y-2 text-[13px]">
                <li>
                  <button type="button" onClick={() => openLegal("privacy")} className="hover:text-neon hover:underline">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => openLegal("terms")} className="hover:text-neon hover:underline">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => openLegal("cookies")} className="hover:text-neon hover:underline">
                    Cookie Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={resetConsent} className="hover:text-neon hover:underline">
                    Cookie settings
                  </button>
                </li>
              </ul>
              {consent && (
                <p className="mt-3 text-[12px]">
                  Cookie choice: {consent.decision === "accepted" ? "Accepted all" : "Essential only"}
                </p>
              )}
            </nav>

            <nav aria-label="Contact">
              <h2 className="font-mono text-[12px] uppercase tracking-widest text-neon">Contact</h2>
              <ul className="mt-3 space-y-2 text-[13px]">
                <li>
                  <a href={`mailto:${COMPANY.email}`} className="hover:text-neon hover:underline">
                    {COMPANY.email}
                  </a>
                </li>
                {COMPANY.phones.map((phone) => (
                  <li key={phone}>
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-neon hover:underline">
                      {phone}
                    </a>
                  </li>
                ))}
                <li className="text-[13px]">{COMPANY_ADDRESS_LINE}</li>
              </ul>
              <Link
                to="/enroll"
                className="mt-4 inline-flex rounded-pill border border-neon/60 px-4 py-2 text-[13px] text-neon transition-colors hover:bg-neon/10"
              >
                Enroll Now
              </Link>
            </nav>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-border pt-5 text-[12px] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Copyright &copy; {new Date().getFullYear()} Cyber Wolf. All rights reserved.
            </p>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
              learn<span className="text-neon">.</span> secure<span className="text-neon">.</span> build
              <span className="text-neon">.</span>
            </p>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
}
