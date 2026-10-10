import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
const NAV_ITEMS = [
    { to: "/", label: "Home", end: true },
    { to: "/courses", label: "Courses" },
    { to: "/pricing", label: "Pricing" },
    { to: "/about", label: "About" },
    { to: "/faq", label: "FAQ" },
];
function Brand() {
    return (_jsxs(Link, { to: "/", className: "flex items-center gap-2.5 rounded-md", "aria-label": "CyberWolf 360 \u2014 home", children: [_jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-md border border-accent/30 bg-accent/10", children: _jsx(ShieldCheck, { className: "h-5 w-5 text-accent", "aria-hidden": "true" }) }), _jsxs("span", { className: "text-base font-bold tracking-wide", children: ["CyberWolf", _jsx("span", { className: "text-accent", children: "360" })] })] }));
}
export function Layout() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const firstLinkRef = useRef(null);
    // Close the mobile menu on navigation and move focus sensibly.
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);
    // Move focus to the mobile menu's first link when it opens.
    useEffect(() => {
        if (menuOpen)
            firstLinkRef.current?.focus();
    }, [menuOpen]);
    // Close on Escape.
    useEffect(() => {
        if (!menuOpen)
            return;
        const onKey = (event) => {
            if (event.key === "Escape")
                setMenuOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen]);
    return (_jsxs("div", { className: "flex min-h-dvh flex-col bg-background", children: [_jsx("a", { href: "#main", className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-primary-foreground", children: "Skip to content" }), _jsxs("header", { className: "sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur", children: [_jsxs("nav", { className: "container flex h-16 items-center justify-between", "aria-label": "Primary", children: [_jsx(Brand, {}), _jsx("ul", { className: "hidden items-center gap-1 md:flex", children: NAV_ITEMS.map((item) => (_jsx("li", { children: _jsx(NavLink, { to: item.to, end: "end" in item ? item.end : false, className: ({ isActive }) => cn("rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground", isActive && "text-foreground"), children: item.label }) }, item.to))) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { asChild: true, size: "sm", className: "hidden sm:inline-flex", children: _jsx(Link, { to: "/enroll", children: "Enroll Now" }) }), _jsx("button", { type: "button", className: "inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground md:hidden", "aria-expanded": menuOpen, "aria-controls": "mobile-menu", "aria-label": menuOpen ? "Close menu" : "Open menu", onClick: () => setMenuOpen((open) => !open), children: menuOpen ? _jsx(X, { className: "h-5 w-5" }) : _jsx(Menu, { className: "h-5 w-5" }) })] })] }), menuOpen && (_jsx("div", { id: "mobile-menu", className: "border-t border-border/70 bg-background md:hidden", children: _jsxs("ul", { className: "container flex flex-col py-2", children: [NAV_ITEMS.map((item, index) => (_jsx("li", { children: _jsx(NavLink, { ref: index === 0 ? firstLinkRef : undefined, to: item.to, end: "end" in item ? item.end : false, className: ({ isActive }) => cn("block rounded-md px-3 py-3 text-sm font-medium text-muted hover:bg-background-secondary hover:text-foreground", isActive && "text-foreground"), children: item.label }) }, item.to))), _jsx("li", { className: "px-3 py-2", children: _jsx(Button, { asChild: true, className: "w-full", children: _jsx(Link, { to: "/enroll", children: "Enroll Now" }) }) })] }) }))] }), _jsx("main", { id: "main", className: "flex-1", children: _jsx(Outlet, {}) }), _jsxs("footer", { className: "border-t border-border/70 bg-background-secondary", children: [_jsxs("div", { className: "container grid gap-8 py-12 md:grid-cols-3", children: [_jsxs("div", { children: [_jsx(Brand, {}), _jsx("p", { className: "mt-3 max-w-xs text-sm text-muted", children: "Explore technology courses designed to help you develop practical knowledge." }), _jsx("p", { className: "mt-3 text-sm font-semibold text-accent", children: "Learn. Secure. Build." })] }), _jsxs("nav", { "aria-label": "Footer", children: [_jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Explore" }), _jsxs("ul", { className: "mt-3 space-y-2 text-sm", children: [NAV_ITEMS.map((item) => (_jsx("li", { children: _jsx(Link, { to: item.to, className: "text-muted hover:text-foreground", children: item.label }) }, item.to))), _jsx("li", { children: _jsx(Link, { to: "/enroll", className: "text-muted hover:text-foreground", children: "Enroll" }) })] })] }), _jsxs("nav", { "aria-label": "Legal", children: [_jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Legal" }), _jsxs("ul", { className: "mt-3 space-y-2 text-sm", children: [_jsx("li", { children: _jsx(Link, { to: "/privacy", className: "text-muted hover:text-foreground", children: "Privacy Policy" }) }), _jsx("li", { children: _jsx(Link, { to: "/terms", className: "text-muted hover:text-foreground", children: "Terms of Service" }) })] })] })] }), _jsx("div", { className: "border-t border-border/70", children: _jsxs("div", { className: "container py-4 text-xs text-muted", children: ["\u00A9 ", new Date().getFullYear(), " CyberWolf 360. Registration submission does not guarantee admission or payment."] }) })] })] }));
}
