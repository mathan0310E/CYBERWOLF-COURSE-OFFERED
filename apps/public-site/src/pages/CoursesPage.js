import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { COURSES } from "@cyberwolf/shared-types";
import { courseIcon } from "@/components/course-icons";
import { Button } from "@/components/ui/button";
export function CoursesPage() {
    return (_jsxs("div", { className: "container py-16", children: [_jsxs("header", { className: "mx-auto max-w-2xl text-center", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight sm:text-4xl", children: "Courses" }), _jsx("p", { className: "mt-3 text-muted", children: "Explore the courses available on CyberWolf 360. Descriptions are general marketing copy and are not a verified syllabus." })] }), _jsx("div", { className: "mt-12 grid gap-6 md:grid-cols-3", children: COURSES.map((course) => {
                    const Icon = courseIcon(course);
                    return (_jsxs("article", { className: "flex flex-col rounded-lg border border-border bg-card p-6", children: [_jsx("span", { className: "flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background-secondary", children: _jsx(Icon, { className: "h-5 w-5 text-accent", "aria-hidden": "true" }) }), _jsx("h2", { className: "mt-4 text-lg font-semibold", children: course.name }), _jsx("p", { className: "mt-2 flex-1 text-sm text-muted", children: course.description })] }, course.id));
                }) }), _jsx("div", { className: "mt-12 text-center", children: _jsx(Button, { asChild: true, size: "lg", children: _jsx(Link, { to: "/enroll", children: "Select courses and enroll" }) }) })] }));
}
