import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
export function NotFoundPage() {
    return (_jsxs("div", { className: "container flex min-h-[50vh] flex-col items-center justify-center py-24 text-center", children: [_jsx("p", { className: "text-sm font-semibold text-accent", children: "404" }), _jsx("h1", { className: "mt-2 text-3xl font-bold tracking-tight", children: "Page not found" }), _jsx("p", { className: "mt-3 max-w-md text-muted", children: "The page you are looking for does not exist or has moved." }), _jsx(Button, { asChild: true, className: "mt-6", children: _jsx(Link, { to: "/", children: "Back to home" }) })] }));
}
