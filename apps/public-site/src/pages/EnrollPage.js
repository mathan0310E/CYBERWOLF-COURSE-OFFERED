import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { COURSES } from "@cyberwolf/shared-types";
import { registrationInputSchema } from "@cyberwolf/validation";
import { MAX_COURSES, isSubmittable } from "@cyberwolf/pricing";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseCard } from "@/components/course-card";
import { PricePreview } from "@/components/price-preview";
import { ApiError, submitRegistration } from "@/lib/api";
/**
 * Registration form.
 *
 * Uses React Hook Form + the shared Zod schema for inline validation. Course
 * selection is held in form state so the same value drives the preview and the
 * submitted payload. The server recalculates the price authoritatively.
 */
export function EnrollPage() {
    const [receipt, setReceipt] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    // Guards against duplicate submission from rapid double-clicks / retries.
    const idempotencyKey = useRef(typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `idem-${Date.now()}`);
    const submittingRef = useRef(false);
    const { register, handleSubmit, setValue, watch, setError, formState: { errors }, } = useForm({
        resolver: zodResolver(registrationInputSchema),
        defaultValues: {
            fullName: "",
            email: "",
            mobile: "",
            courseIds: [],
            educationOrOccupation: "",
            city: "",
            message: "",
            privacyConsent: false,
        },
        mode: "onBlur",
    });
    const courseIds = watch("courseIds");
    const privacyConsent = watch("privacyConsent");
    const selectedCount = courseIds.length;
    const atLimit = selectedCount >= MAX_COURSES;
    function toggleCourse(id) {
        const current = courseIds;
        const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
        setValue("courseIds", next, {
            shouldValidate: true,
            shouldDirty: true,
        });
    }
    const serverIssues = useMemo(() => {
        const map = {};
        for (const issue of submitError?.issues ?? []) {
            if (issue.path)
                map[issue.path] = issue.message;
        }
        return map;
    }, [submitError]);
    async function onSubmit(values) {
        if (submittingRef.current)
            return;
        submittingRef.current = true;
        setSubmitting(true);
        setSubmitError(null);
        try {
            const result = await submitRegistration(values, { idempotencyKey: idempotencyKey.current });
            setReceipt(result);
        }
        catch (error) {
            if (error instanceof ApiError) {
                setSubmitError(error);
                // Surface server-side field errors inline.
                for (const [path, message] of Object.entries(serverIssues)) {
                    setError(path, { type: "server", message });
                }
                // Rotate the idempotency key so a genuine retry is a new request, but
                // an accidental double-submit of the same data is still deduplicated.
            }
            else {
                setSubmitError(new ApiError(0, "NETWORK_ERROR", "Unexpected error. Please try again.", "local"));
            }
        }
        finally {
            setSubmitting(false);
            submittingRef.current = false;
        }
    }
    if (receipt) {
        return _jsx(SuccessPanel, { receipt: receipt, onReset: () => setReceipt(null) });
    }
    return (_jsxs("div", { className: "container py-16", children: [_jsxs("header", { className: "mx-auto max-w-2xl text-center", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight sm:text-4xl", children: "Enroll in a course" }), _jsx("p", { className: "mt-3 text-muted", children: "Select one or two courses and provide your details. We will confirm your registration by email." })] }), _jsxs("form", { className: "mt-12 grid gap-8 lg:grid-cols-[1.6fr_1fr]", onSubmit: handleSubmit(onSubmit), noValidate: true, "aria-busy": submitting, children: [_jsxs("div", { className: "space-y-8", children: [_jsxs("fieldset", { children: [_jsx("legend", { className: "text-lg font-semibold", children: "Choose your courses" }), _jsxs("p", { className: "mt-1 text-sm text-muted", children: ["Select one or two courses (", selectedCount, "/", MAX_COURSES, " selected)."] }), _jsx("div", { className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: COURSES.map((course) => (_jsx(CourseCard, { course: course, selected: courseIds.includes(course.id), onToggle: toggleCourse, disabled: !courseIds.includes(course.id) && atLimit }, course.id))) }), errors.courseIds && (_jsx("p", { role: "alert", className: "mt-3 text-sm text-destructive", children: errors.courseIds.message }))] }), _jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [_jsx(Field, { label: "Full name", htmlFor: "fullName", error: errors.fullName?.message, required: true, children: _jsx(Input, { id: "fullName", autoComplete: "name", "aria-invalid": Boolean(errors.fullName), ...register("fullName") }) }), _jsx(Field, { label: "Email", htmlFor: "email", error: errors.email?.message, required: true, children: _jsx(Input, { id: "email", type: "email", autoComplete: "email", "aria-invalid": Boolean(errors.email), ...register("email") }) }), _jsx(Field, { label: "Mobile number", htmlFor: "mobile", error: errors.mobile?.message, required: true, children: _jsx(Input, { id: "mobile", type: "tel", inputMode: "tel", autoComplete: "tel", "aria-invalid": Boolean(errors.mobile), ...register("mobile") }) }), _jsx(Field, { label: "Education or occupation (optional)", htmlFor: "educationOrOccupation", error: errors.educationOrOccupation?.message, children: _jsx(Input, { id: "educationOrOccupation", autoComplete: "organization-title", ...register("educationOrOccupation") }) }), _jsx(Field, { label: "City (optional)", htmlFor: "city", error: errors.city?.message, children: _jsx(Input, { id: "city", autoComplete: "address-level2", ...register("city") }) }), _jsx("div", { className: "sm:col-span-2", children: _jsx(Field, { label: "Message (optional)", htmlFor: "message", error: errors.message?.message, children: _jsx(Textarea, { id: "message", ...register("message") }) }) })] }), _jsx("div", { children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Checkbox, { id: "privacyConsent", checked: privacyConsent, onCheckedChange: (checked) => setValue("privacyConsent", checked === true, { shouldValidate: true, shouldDirty: true }), "aria-invalid": Boolean(errors.privacyConsent), "aria-describedby": "privacyConsent-hint" }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "privacyConsent", className: "text-sm text-muted", children: ["I consent to CyberWolf 360 processing my details to handle this registration, as described in the", " ", _jsx(Link, { to: "/privacy", className: "text-accent underline underline-offset-2", children: "Privacy Policy" }), "."] }), _jsx("p", { id: "privacyConsent-hint", className: "mt-1 text-xs text-muted", children: "We do not automatically subscribe you to marketing emails." }), errors.privacyConsent && (_jsx("p", { role: "alert", className: "mt-1 text-sm text-destructive", children: errors.privacyConsent.message }))] })] }) }), submitError && _jsx(ErrorBanner, { error: submitError })] }), _jsxs("aside", { className: "space-y-4 lg:sticky lg:top-24 lg:self-start", children: [_jsx(PricePreview, { courseIds: courseIds, compact: true }), _jsx(Button, { type: "submit", size: "lg", className: "w-full", disabled: submitting || !isSubmittable(courseIds), children: submitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 animate-spin", "aria-hidden": "true" }), "Submitting\u2026"] })) : ("Submit registration") }), _jsx("p", { className: "text-xs text-muted", children: "Submitting a registration does not confirm admission or payment. We will contact you using the details you provide." })] })] })] }));
}
function Field({ label, htmlFor, error, required, children, }) {
    return (_jsxs("div", { className: "space-y-1.5", children: [_jsxs(Label, { htmlFor: htmlFor, children: [label, required && _jsx("span", { className: "ml-0.5 text-destructive", children: "*" })] }), children, error && (_jsx("p", { role: "alert", className: "text-sm text-destructive", children: error }))] }));
}
function ErrorBanner({ error }) {
    const retryable = error.code === "NETWORK_ERROR" || error.status >= 500;
    return (_jsxs("div", { role: "alert", className: "flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm", children: [_jsx(AlertTriangle, { className: "mt-0.5 h-4 w-4 shrink-0 text-destructive", "aria-hidden": "true" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-foreground", children: retryable ? "We could not submit your registration" : "Please check your details" }), _jsx("p", { className: "mt-1 text-muted", children: error.message }), error.requestId && (_jsxs("p", { className: "mt-1 font-mono text-xs text-muted/80", children: ["Reference: ", error.requestId] })), retryable && (_jsxs("p", { className: "mt-2 flex items-center gap-1.5 text-xs text-muted", children: [_jsx(RefreshCw, { className: "h-3 w-3", "aria-hidden": "true" }), "Your input has been kept. You can safely try again."] }))] })] }));
}
function SuccessPanel({ receipt, onReset }) {
    return (_jsx("div", { className: "container max-w-2xl py-20", children: _jsxs(Card, { children: [_jsxs(CardHeader, { className: "items-center text-center", children: [_jsx("span", { className: "flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent/10", children: _jsx(CheckCircle2, { className: "h-7 w-7 text-accent", "aria-hidden": "true" }) }), _jsx(CardTitle, { className: "mt-4 text-2xl", children: "Registration received" })] }), _jsxs(CardContent, { className: "text-center", children: [_jsx("p", { className: "text-muted", children: "Thank you. Your registration has been received. We have sent a confirmation to your email address." }), _jsxs("div", { className: "mt-6 rounded-md border border-border bg-background-secondary p-4 text-left", children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-muted", children: "Your reference" }), _jsx("p", { className: "mt-1 font-mono text-lg font-semibold text-accent", children: receipt.reference }), _jsxs("dl", { className: "mt-4 space-y-1.5 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("dt", { className: "text-muted", children: "Courses" }), _jsx("dd", { className: "text-foreground", children: receipt.courseIds.map((id) => COURSES.find((c) => c.id === id)?.name ?? id).join(", ") })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("dt", { className: "text-muted", children: "Final price" }), _jsx("dd", { className: "font-semibold text-accent", children: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(receipt.price.finalPrice) })] })] })] }), _jsx("p", { className: "mt-5 text-xs text-muted", children: "Please keep your reference for future correspondence. Submitting this registration does not confirm admission or payment." }), _jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-3", children: [_jsx(Button, { onClick: onReset, variant: "outline", children: "Submit another registration" }), _jsx(Button, { asChild: true, children: _jsx(Link, { to: "/", children: "Back to home" }) })] })] })] }) }));
}
