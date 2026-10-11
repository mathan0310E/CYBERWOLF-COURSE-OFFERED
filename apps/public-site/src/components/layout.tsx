import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPANY, COMPANY_ADDRESS_LINE } from "@cyberwolf/shared-types";
import { CompanyWordmark } from "@/components/brand";
import { SocialLinks } from "@/components/social-links";
import { MailIcon, MapPinIcon, PhoneIcon } from "@/components/brand-icons";
import { CookieBanner } from "@/components/cookie-banner";
import { useConsent } from "@/lib/consent";
import { useLegal } from "@/lib/legal";

/**
 * Site chrome modelled on the Apple Store global navigation and footer:
 * a 44px translucent bar that gains a blur + hairline once scrolled, a slim
 * secondary "store" bar holding the in-page section links, and a footer built
 * from Apple's `#F5F5F7` directory columns with a hairline rule above the
 * copyright line.
 */

const NAV_LINKS = [
  { label: "Courses", href: "/#courses" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
];

function BrandMark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onNavigate}
      className="flex items-center gap-2 rounded-sm px-1 py-1 text-[14px] font-semibold text-apple-ink"
      aria-label="CyberWolf 360 home"
    >
      <CompanyWordmark className="h-5 w-auto" />
      <span className="font-display tracking-[-0.02em]">CyberWolf 360</span>
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

  // Close the mobile menu whenever the route or hash changes.
  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-pill focus:bg-apple-blue focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-50">
        {/* Global nav — Apple's 44px translucent bar. */}
        <nav
          aria-label="Primary"
          className={cn(
            "transition-colors duration-300",
            scrolled
              ? "border-b border-border/70 bg-background/80 backdrop-blur-xl"
              : "border-b border-transparent bg-background/60 backdrop-blur-md",
          )}
        >
          <div className="mx-auto flex h-11 max-w-[1024px] items-center justify-between gap-6 px-6">
            <BrandMark />
            <ul className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="rounded-sm px-1 py-1 text-[12px] text-apple-ink/85 transition-colors hover:text-apple-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3">
              <Link
                to="/enroll"
                className="hidden rounded-pill bg-apple-blue px-3.5 py-1.5 text-[12px] text-white transition-colors hover:bg-apple-blue-hover sm:inline-block"
              >
                Enroll Now
              </Link>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="rounded-sm p-1 text-apple-ink md:hidden"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Store sub-nav — the slim secondary bar under the global nav. */}
        <div className="hidden border-b border-border/70 bg-background-secondary/80 backdrop-blur-xl md:block">
          <div className="mx-auto flex h-10 max-w-[1024px] items-center justify-between px-6">
            <span className="text-[12px] font-semibold text-apple-ink">CyberWolf 360 Store</span>
            <ul className="flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[12px] text-apple-ink/85 transition-colors hover:text-apple-blue"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile flyout. */}
        {open && (
          <div
            id="mobile-menu"
            className="border-b border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <ul className="mx-auto max-w-[1024px] px-6 py-2">
              {NAV_LINKS.map((link) => (
                <li key={link.label} className="border-b border-border/60 last:border-0">
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-[17px] font-medium text-apple-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-3">
                <Link
                  to="/enroll"
                  onClick={() => setOpen(false)}
                  className="inline-block rounded-pill bg-apple-blue px-4 py-2 text-[14px] text-white"
                >
                  Enroll Now
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      <main id="main" className="flex-1 pt-[76px] md:pt-[84px]">
        <Outlet />
      </main>

      <footer className="bg-background-secondary text-apple-grey" role="contentinfo">
        <div className="mx-auto max-w-[1024px] px-6 py-10">
          <div className="grid gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2">
                <CompanyWordmark className="h-5 w-auto" />
                <span className="font-display text-[14px] font-semibold text-apple-ink">
                  CyberWolf 360
                </span>
              </div>
              <p className="mt-3 max-w-sm text-[12px] leading-relaxed">
                {COMPANY.servicesTagline}. {COMPANY.tagline} Registration submission does not
                guarantee admission or payment.
              </p>
              <div className="mt-4">
                <SocialLinks />
              </div>
            </div>

            <nav aria-label="Explore">
              <h2 className="text-[12px] font-semibold text-apple-ink">Explore</h2>
              <ul className="mt-3 space-y-2 text-[12px]">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-apple-ink hover:underline">
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <Link to="/enroll" className="hover:text-apple-ink hover:underline">
                    Enroll
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="Legal">
              <h2 className="text-[12px] font-semibold text-apple-ink">Legal</h2>
              <ul className="mt-3 space-y-2 text-[12px]">
                <li>
                  <button type="button" onClick={() => openLegal("privacy")} className="hover:text-apple-ink hover:underline">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => openLegal("terms")} className="hover:text-apple-ink hover:underline">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => openLegal("cookies")} className="hover:text-apple-ink hover:underline">
                    Cookie Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={resetConsent} className="hover:text-apple-ink hover:underline">
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
              <h2 className="text-[12px] font-semibold text-apple-ink">Contact</h2>
              <ul className="mt-3 space-y-2 text-[12px]">
                <li className="flex items-center gap-2">
                  <MailIcon className="h-3.5 w-3.5 shrink-0 text-apple-blue" />
                  <a href={`mailto:${COMPANY.email}`} className="hover:text-apple-ink hover:underline">
                    {COMPANY.email}
                  </a>
                </li>
                {COMPANY.phones.map((phone) => (
                  <li key={phone} className="flex items-center gap-2">
                    <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-apple-blue" />
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-apple-ink hover:underline">
                      {phone}
                    </a>
                  </li>
                ))}
                <li className="flex items-start gap-2">
                  <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-apple-blue" />
                  <span>{COMPANY_ADDRESS_LINE}</span>
                </li>
              </ul>
            </nav>
          </div>

          <div className="mt-8 border-t border-border pt-5 text-[12px]">
            <p>
              Copyright &copy; {new Date().getFullYear()} Cyber Wolf. All rights reserved.
              Registration submission does not guarantee admission or payment.
            </p>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
}
