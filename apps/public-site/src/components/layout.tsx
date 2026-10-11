import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";
import { CookieBanner } from "@/components/cookie-banner";
import { SocialLinks } from "@/components/social-links";
import { GlobeIcon, MailIcon, MapPinIcon, PhoneIcon } from "@/components/brand-icons";
import { useLegal } from "@/lib/legal";
import { useConsent } from "@/lib/consent";
import { COMPANY, COMPANY_ADDRESS_LINE } from "@cyberwolf/shared-types";
import { cn } from "@/lib/utils";

/**
 * Single-page navigation. Courses, Pricing, About and FAQ are in-page anchors on
 * the main page rather than separate routes.
 */
const NAV_ITEMS = [
  { href: "#courses", label: "Courses" },
  { href: "#pricing", label: "Pricing" },
  { href: "#about", label: "About" },
  { href: "#faq", label: "FAQ" },
] as const;

const HOME_LINK = "/";

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const { open } = useLegal();
  const { consent, reset } = useConsent();

  // Close the mobile menu on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Condense the fixed header once the page is scrolled (Hopewell-style).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Move focus to the mobile menu's first link when it opens.
  useEffect(() => {
    if (menuOpen) firstLinkRef.current?.focus();
  }, [menuOpen]);

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:shadow-soft"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled ? "border-b border-border/70 bg-white/85 py-3 shadow-soft backdrop-blur-md" : "bg-transparent py-5",
        )}
      >
        <div className="container flex items-center justify-between gap-4">
          <Brand />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="relative rounded-md px-4 py-2 font-display text-sm font-medium text-foreground transition-colors after:absolute after:bottom-1 after:left-4 after:right-4 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand-green after:transition-transform hover:after:scale-x-100"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden lg:block">
            <Button asChild>
              <Link to="/enroll">
                Enroll Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-[68px] z-40 border-b border-border bg-card shadow-soft lg:hidden"
        >
          <nav aria-label="Mobile" className="container py-4">
            <ul className="flex flex-col">
              <li>
                <Link
                  ref={firstLinkRef}
                  to={HOME_LINK}
                  className="block rounded-md px-3 py-3 font-display text-base font-medium hover:bg-background-secondary"
                >
                  Home
                </Link>
              </li>
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="block rounded-md px-3 py-3 font-display text-base font-medium hover:bg-background-secondary"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="mt-2">
                <Button asChild className="w-full">
                  <Link to="/enroll">Enroll Now</Link>
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Offset for the fixed header. */}
      <main id="main" className="flex-1 pt-[68px]">
        <Outlet />
      </main>

      <footer className="relative overflow-hidden bg-[#0B1220] text-slate-400">
        <div className="container py-16">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Brand />
              <p className="mt-4 max-w-xs text-sm leading-relaxed">
                {COMPANY.servicesTagline}. {COMPANY.tagline}
              </p>
              <SocialLinks className="mt-5" />
            </div>

            <nav aria-label="Explore">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white">Explore</h2>
              <span className="mt-3 block h-0.5 w-8 rounded-full bg-gradient-to-r from-brand-green to-brand-amber" />
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a href="#courses" className="transition-colors hover:text-brand-green">
                    Courses
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="transition-colors hover:text-brand-green">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#about" className="transition-colors hover:text-brand-green">
                    About
                  </a>
                </li>
                <li>
                  <a href="#faq" className="transition-colors hover:text-brand-green">
                    FAQ
                  </a>
                </li>
                <li>
                  <Link to="/enroll" className="transition-colors hover:text-brand-green">
                    Enroll
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="Legal">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white">Legal</h2>
              <span className="mt-3 block h-0.5 w-8 rounded-full bg-gradient-to-r from-brand-green to-brand-amber" />
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <button type="button" onClick={() => open("privacy")} className="transition-colors hover:text-brand-green">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => open("terms")} className="transition-colors hover:text-brand-green">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => open("cookies")} className="transition-colors hover:text-brand-green">
                    Cookie Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={reset} className="transition-colors hover:text-brand-green">
                    Cookie settings
                  </button>
                </li>
              </ul>
              {consent && (
                <p className="mt-3 text-xs">
                  Cookie choice: {consent.decision === "accepted" ? "Accepted all" : "Essential only"}
                </p>
              )}
            </nav>

            <nav aria-label="Contact">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white">Contact</h2>
              <span className="mt-3 block h-0.5 w-8 rounded-full bg-gradient-to-r from-brand-green to-brand-amber" />
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-center gap-2.5">
                  <MailIcon className="h-4 w-4 shrink-0 text-brand-green" />
                  <a href={`mailto:${COMPANY.email}`} className="transition-colors hover:text-brand-green">
                    {COMPANY.email}
                  </a>
                </li>
                {COMPANY.phones.map((phone) => (
                  <li key={phone} className="flex items-center gap-2.5">
                    <PhoneIcon className="h-4 w-4 shrink-0 text-brand-green" />
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className="transition-colors hover:text-brand-green">
                      {phone}
                    </a>
                  </li>
                ))}
                <li className="flex items-start gap-2.5">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                  <span>{COMPANY_ADDRESS_LINE}</span>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container flex flex-col gap-2 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {COMPANY.legalName}. Registration submission does not guarantee admission or
              payment.
            </p>
            <a
              href={COMPANY.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-green"
            >
              <GlobeIcon className="h-4 w-4" />
              {COMPANY.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
}
