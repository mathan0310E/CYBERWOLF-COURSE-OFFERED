import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { calculatePrice, formatINR, isSubmittable } from "@cyberwolf/pricing";
import { CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
/**
 * Client-side price preview. The authoritative price is always recalculated by
 * the trusted backend; this is shown for user feedback only.
 */
export function PricePreview({ courseIds, compact = false }) {
    const price = calculatePrice(courseIds);
    const submittable = isSubmittable(courseIds);
    return (_jsxs(Card, { children: [_jsx(CardHeader, { className: compact ? "p-5 pb-2" : undefined, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Your price" }), price.courseCount > 0 && _jsxs(Badge, { variant: "secondary", children: [price.courseCount, " course", price.courseCount > 1 ? "s" : ""] })] }) }), _jsxs(CardContent, { className: compact ? "p-5 pt-0" : undefined, children: [price.courseCount === 0 ? (_jsxs("div", { className: "flex items-start gap-2 text-sm text-muted", children: [_jsx(Info, { className: "mt-0.5 h-4 w-4 shrink-0", "aria-hidden": "true" }), _jsx("p", { children: "Select one or two courses to see your price." })] })) : (_jsxs("dl", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("dt", { className: "text-muted", children: "Original price" }), _jsx("dd", { className: "text-muted line-through", children: formatINR(price.originalPrice) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("dt", { className: "text-muted", children: "You save" }), _jsx("dd", { className: "font-medium text-secondary", children: formatINR(price.discount) })] }), _jsxs("div", { className: "flex items-center justify-between border-t border-border/70 pt-2", children: [_jsx("dt", { className: "font-semibold text-foreground", children: "Final price" }), _jsx("dd", { className: "text-xl font-bold text-accent", children: formatINR(price.finalPrice) })] })] })), _jsxs("p", { className: "mt-3 flex items-start gap-2 text-xs text-muted", children: [submittable && price.courseCount > 0 && (_jsx(CheckCircle2, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-accent", "aria-hidden": "true" })), _jsx("span", { children: "Prices are confirmed on the server when your registration is received. Selecting courses does not confirm admission or payment." })] })] })] }));
}
