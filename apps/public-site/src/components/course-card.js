import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { courseIcon } from "@/components/course-icons";
import { cn } from "@/lib/utils";
/**
 * A course card. When `selectable` it renders an accessible checkbox whose
 * label is the whole card, so keyboard and touch input both work.
 */
export function CourseCard({ course, selected, onToggle, selectable = true, disabled = false }) {
    const Icon = courseIcon(course);
    const inputId = `course-${course.id}`;
    return (_jsxs(Card, { className: cn("group relative h-full transition-colors", selectable && "hover:border-accent/40", selected && "border-accent/60 bg-accent/[0.04]"), children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsx("span", { className: cn("flex h-11 w-11 items-center justify-center rounded-md border", selected ? "border-accent/50 bg-accent/10" : "border-border bg-background-secondary"), children: _jsx(Icon, { className: cn("h-5 w-5", selected ? "text-accent" : "text-muted"), "aria-hidden": "true" }) }), selected && _jsx(Badge, { children: "Selected" })] }), _jsx(CardTitle, { className: "mt-4", children: course.name }), _jsx(CardDescription, { children: course.description })] }), selectable && (_jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Checkbox, { id: inputId, checked: selected, disabled: disabled, onCheckedChange: () => onToggle(course.id), "aria-describedby": `${inputId}-hint` }), _jsx("label", { htmlFor: inputId, className: "cursor-pointer text-sm text-muted select-none", children: selected ? "Selected" : "Select this course" })] }), _jsxs("p", { id: `${inputId}-hint`, className: "sr-only", children: ["Toggle selection of ", course.name, "."] })] }))] }));
}
