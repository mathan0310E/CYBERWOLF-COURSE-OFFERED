import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { COMPANY, COMPANY_ADDRESS_LINE } from "@cyberwolf/shared-types";
import { CompanyWordmark } from "@/components/brand";
import { SocialLinks } from "@/components/social-links";
import { CookieBanner } from "@/components/cookie-banner";
import { useConsent } from "@/lib/consent";
import { useLegal } from "@/lib/legal";
import { cn } from "@/lib/utils";

/**
 * Site chrome, editorial "studio" style: a floating white pill navigation bar
 * (logo + links + a lilac Enroll button) and a directory footer.
 *
 * There is intentionally no admin link — the private admin app is a separate
 * build and is never referenced from the public bundle.
 */

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/#courses" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
];

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
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-pill focus:border focus:border-border focus:bg-card focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-50">
        <nav aria-label="Primary" className="mx-auto flex max-w-[1240px] flex-col gap-2 px-4 pt-4 sm:px-6">
          <div
            className={cn(
              "flex items-center justify-between gap-4 rounded-pill border border-border bg-card/95 px-4 py-2 backdrop-blur transition-shadow duration-300",
              scrolled ? "shadow-lift" : "shadow-card",
            )}
          >
            <Link
              to="/"
              className="flex items-center gap-2 rounded-pill px-2 py-1 text-[16px] font-semibold"
              aria-label="CyberWolf 360 home"
            >
              <CompanyWordmark className="h-7 w-7" />
              <span className="font-display tracking-tight">
                CyberWolf<span className="text-muted">360</span>
              </span>
            </Link>

            <ul className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="rounded-pill px-3.5 py-2 text-[15px] font-medium transition-colors hover:bg-background-secondary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <Link
                to="/enroll"
                className="hidden rounded-pill border border-border bg-lilac px-5 py-2 text-[15px] font-semibold transition-colors hover:bg-[#d0b7f5] sm:inline-block"
              >
                Enroll Now
              </Link>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="rounded-full border border-border bg-card p-2 md:hidden"
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {open && (
            <div id="mobile-menu" className="rounded-xl border border-border bg-card p-3 shadow-lift md:hidden">
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-pill px-4 py-2.5 text-[16px] font-medium hover:bg-background-secondary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/enroll"
                    onClick={() => setOpen(false)}
                    className="mt-1 block rounded-pill border border-border bg-lilac px-4 py-2.5 text-center text-[16px] font-semibold"
                  >
                    Enroll Now
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </nav>
      </header>

      <main id="main" className="flex-1 pt-28">
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-border bg-background-secondary" role="contentinfo">
        <div className="mx-auto max-w-[1240px] px-6 py-14">
          <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2">
                <CompanyWordmark className="h-8 w-8" />
                <span className="font-display text-[20px] font-semibold tracking-tight">
                  CyberWolf<span className="text-muted">360</span>
                </span>
              </div>
              <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
                {COMPANY.servicesTagline}. {COMPANY.tagline} Registration submission does not guarantee
                admission or payment.
              </p>
              <div className="mt-5">
                <SocialLinks />
              </div>
            </div>

            <nav aria-label="Legal">
              <h2 className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">
                Legal
              </h2>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                <li>
                  <button
                    type="button"
                    onClick={() => openLegal("privacy")}
                    className="hover:underline"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openLegal("terms")}
                    className="hover:underline"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openLegal("cookies")}
                    className="hover:underline"
                  >
                    Cookie Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={resetConsent} className="hover:underline">
                    Cookie settings
                  </button>
                </li>
              </ul>
              {consent && (
                <p className="mt-3 text-[12px] text-muted">
                  Cookie choice: {consent.decision === "accepted" ? "Accepted all" : "Essential only"}
                </p>
              )}
            </nav>

            <nav aria-label="Contact">
              <h2 className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">
                Contact
              </h2>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                <li>
                  <a href={`mailto:${COMPANY.email}`} className="hover:underline">
                    {COMPANY.email}
                  </a>
                </li>
                {COMPANY.phones.map((phone) => (
                  <li key={phone}>
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:underline">
                      {phone}
                    </a>
                  </li>
                ))}
                <li className="text-[14px] text-muted">{COMPANY_ADDRESS_LINE}</li>
              </ul>
              <Link
                to="/enroll"
                className="mt-5 inline-flex rounded-pill border border-border bg-card px-4 py-2 text-[14px] font-semibold transition-colors hover:bg-background"
              >
                Enroll Now
              </Link>
            </nav>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>Copyright &copy; {new Date().getFullYear()} Cyber Wolf. All rights reserved.</p>
            <p className="font-display italic">
              learn<span className="not-italic">.</span> secure<span className="not-italic">.</span> build
              <span className="not-italic">.</span>
            </p>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
}
