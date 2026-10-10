import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";
import { COMPANY } from "@cyberwolf/shared-types";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/courses", label: "Courses" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
] as const;

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  // Close the mobile menu on navigation and move focus sensibly.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Move focus to the mobile menu's first link when it opens.
  useEffect(() => {
    if (menuOpen) firstLinkRef.current?.focus();
  }, [menuOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <nav
          className="container flex h-16 items-center justify-between"
          aria-label="Primary"
        >
          <Brand />

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={"end" in item ? item.end : false}
                  className={({ isActive }) =>
                    cn(
                      "rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground",
                      isActive && "text-foreground",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/enroll">Enroll Now</Link>
            </Button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div id="mobile-menu" className="border-t border-border/70 bg-background md:hidden">
            <ul className="container flex flex-col py-2">
              {NAV_ITEMS.map((item, index) => (
                <li key={item.to}>
                  <NavLink
                    ref={index === 0 ? firstLinkRef : undefined}
                    to={item.to}
                    end={"end" in item ? item.end : false}
                    className={({ isActive }) =>
                      cn(
                        "block rounded-md px-3 py-3 text-sm font-medium text-muted hover:bg-background-secondary hover:text-foreground",
                        isActive && "text-foreground",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li className="px-3 py-2">
                <Button asChild className="w-full">
                  <Link to="/enroll">Enroll Now</Link>
                </Button>
              </li>
            </ul>
          </div>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/70 bg-background-secondary">
        <div className="container grid gap-8 py-12 md:grid-cols-3">
          <div>
            <Brand />
            <p className="mt-3 max-w-xs text-sm text-muted">
              Explore technology courses designed to help you develop practical knowledge.
            </p>
            <p className="mt-3 text-sm font-semibold text-accent">Learn. Secure. Build.</p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted">
              <li>
                <a href={`mailto:${COMPANY.email}`} className="hover:text-foreground">
                  {COMPANY.email}
                </a>
              </li>
              {COMPANY.phones.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-foreground">
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <nav aria-label="Footer">
            <h2 className="text-sm font-semibold text-foreground">Explore</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-muted hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/enroll" className="text-muted hover:text-foreground">
                  Enroll
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Legal">
            <h2 className="text-sm font-semibold text-foreground">Legal</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-border/70">
          <div className="container flex flex-col gap-2 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {COMPANY.legalName}. Registration submission does not guarantee admission or
              payment.
            </p>
            <a
              href={COMPANY.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              {COMPANY.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
