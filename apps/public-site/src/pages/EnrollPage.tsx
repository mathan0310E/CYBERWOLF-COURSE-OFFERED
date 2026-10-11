import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, GraduationCap, Loader2, RefreshCw } from "lucide-react";
import {
  COURSES,
  DEGREE_PROGRAMS,
  DEGREE_PROGRAM_LABELS,
  DEPARTMENTS,
  DEPARTMENT_LABELS,
  STUDY_YEARS,
  STUDY_YEAR_LABELS,
  type CourseId,
  type RegistrationReceipt,
} from "@cyberwolf/shared-types";
import { registrationInputSchema, type RegistrationInput } from "@cyberwolf/validation";
import { MAX_COURSES, isSubmittable } from "@cyberwolf/pricing";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseCard } from "@/components/course-card";
import { PricePreview } from "@/components/price-preview";
import { Seo } from "@/components/seo";
import { useLegal } from "@/lib/legal";
import { ApiError, submitRegistration } from "@/lib/api";

/**
 * Registration form for college students.
 *
 * Uses React Hook Form + the shared Zod schema for inline validation. Course
 * selection is held in form state so the same value drives the preview and the
 * submitted payload. The server recalculates the price authoritatively.
 */
export function EnrollPage() {
  const { open: openLegal } = useLegal();
  const [receipt, setReceipt] = useState<RegistrationReceipt | null>(null);
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Guards against duplicate submission from rapid double-clicks / retries.
  const idempotencyKey = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `idem-${Date.now()}`,
  );
  const submittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationInputSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      courseIds: [],
      college: "",
      degree: undefined,
      yearOfStudy: undefined,
      department: undefined,
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

  function toggleCourse(id: CourseId) {
    const current = courseIds;
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
    setValue("courseIds", next as RegistrationInput["courseIds"], {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  const serverIssues = useMemo(() => {
    const map: Record<string, string> = {};
    for (const issue of submitError?.issues ?? []) {
      if (issue.path) map[issue.path] = issue.message;
    }
    return map;
  }, [submitError]);

  async function onSubmit(values: RegistrationInput) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitRegistration(values, { idempotencyKey: idempotencyKey.current });
      setReceipt(result);
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error);
        // Surface server-side field errors inline.
        for (const [path, message] of Object.entries(serverIssues)) {
          setError(path as keyof RegistrationInput, { type: "server", message });
        }
        // Rotate the idempotency key so a genuine retry is a new request, but
        // an accidental double-submit of the same data is still deduplicated.
      } else {
        setSubmitError(new ApiError(0, "NETWORK_ERROR", "Unexpected error. Please try again.", "local"));
      }
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  if (receipt) {
    return <SuccessPanel receipt={receipt} onReset={() => setReceipt(null)} />;
  }

  return (
    <div className="container py-16">
      <Seo
        title="College student registration"
        description="Register for CyberWolf 360 courses as a college student. Select one or two courses and tell us about your studies. Confirmation by email."
        path="/enroll"
      />
      <header className="mx-auto max-w-2xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-apple-blue/30 bg-apple-blue/5 px-3 py-1 text-xs font-medium text-apple-blue">
          <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
          For college students
        </p>
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">College student registration</h1>
        <p className="mt-3 text-muted">
          Select one or two courses and tell us about your studies. We will confirm your registration by email.
        </p>
      </header>

      <form
        className="mt-12 grid gap-8 lg:grid-cols-[1.6fr_1fr]"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-busy={submitting}
      >
        <div className="space-y-8">
          {/* Course selection */}
          <fieldset>
            <legend className="text-lg font-semibold">Choose your courses</legend>
            <p className="mt-1 text-sm text-muted">
              Select one or two courses ({selectedCount}/{MAX_COURSES} selected).
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {COURSES.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  selected={courseIds.includes(course.id)}
                  onToggle={toggleCourse}
                  disabled={!courseIds.includes(course.id) && atLimit}
                />
              ))}
            </div>
            {errors.courseIds && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {errors.courseIds.message}
              </p>
            )}
          </fieldset>

          {/* Details */}
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold">Your details</h2>
              <p className="mt-1 text-sm text-muted">
                Fields marked with <span className="text-destructive">*</span> are required.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="fullName" error={errors.fullName?.message} required>
                <Input
                  id="fullName"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.fullName)}
                  {...register("fullName")}
                />
              </Field>

              <Field label="Email" htmlFor="email" error={errors.email?.message} required>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
              </Field>

              <Field label="Mobile number" htmlFor="mobile" error={errors.mobile?.message} required>
                <Input
                  id="mobile"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.mobile)}
                  {...register("mobile")}
                />
              </Field>

              <Field label="City (optional)" htmlFor="city" error={errors.city?.message}>
                <Input id="city" autoComplete="address-level2" {...register("city")} />
              </Field>

              <div className="sm:col-span-2">
                <Field
                  label="College / institution"
                  htmlFor="college"
                  error={errors.college?.message}
                  required
                >
                  <Input
                    id="college"
                    autoComplete="organization"
                    placeholder="e.g. Government Engineering College"
                    aria-invalid={Boolean(errors.college)}
                    {...register("college")}
                  />
                </Field>
              </div>

              <Field label="Degree / programme" htmlFor="degree" error={errors.degree?.message} required>
                <Select
                  id="degree"
                  defaultValue=""
                  aria-invalid={Boolean(errors.degree)}
                  {...register("degree")}
                >
                  <option value="" disabled>
                    Select your degree
                  </option>
                  {DEGREE_PROGRAMS.map((program) => (
                    <option key={program} value={program}>
                      {DEGREE_PROGRAM_LABELS[program]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Year of study" htmlFor="yearOfStudy" error={errors.yearOfStudy?.message} required>
                <Select
                  id="yearOfStudy"
                  defaultValue=""
                  aria-invalid={Boolean(errors.yearOfStudy)}
                  {...register("yearOfStudy")}
                >
                  <option value="" disabled>
                    Select your year
                  </option>
                  {STUDY_YEARS.map((year) => (
                    <option key={year} value={year}>
                      {STUDY_YEAR_LABELS[year]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Department" htmlFor="department" error={errors.department?.message} required>
                <Select
                  id="department"
                  defaultValue=""
                  aria-invalid={Boolean(errors.department)}
                  {...register("department")}
                >
                  <option value="" disabled>
                    Select your department
                  </option>
                  {DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>
                      {DEPARTMENT_LABELS[department]}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="sm:col-span-2">
                <Field label="Message (optional)" htmlFor="message" error={errors.message?.message}>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your interests, goals or any questions."
                    {...register("message")}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Consent */}
          <div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="privacyConsent"
                checked={privacyConsent}
                onCheckedChange={(checked) =>
                  setValue("privacyConsent", checked === true, { shouldValidate: true, shouldDirty: true })
                }
                aria-invalid={Boolean(errors.privacyConsent)}
                aria-describedby="privacyConsent-hint"
              />
              <div>
                <label htmlFor="privacyConsent" className="text-sm text-muted">
                  I consent to CyberWolf 360 processing my details to handle this registration, as described in the{" "}
                  <button
                    type="button"
                    onClick={() => openLegal("privacy")}
                    className="text-apple-blue underline underline-offset-2"
                  >
                    Privacy Policy
                  </button>
                  .
                </label>
                <p id="privacyConsent-hint" className="mt-1 text-xs text-muted">
                  We do not automatically subscribe you to marketing emails.
                </p>
                {errors.privacyConsent && (
                  <p role="alert" className="mt-1 text-sm text-destructive">
                    {errors.privacyConsent.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {submitError && <ErrorBanner error={submitError} />}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <PricePreview courseIds={courseIds} compact />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting || !isSubmittable(courseIds)}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Submitting…
              </>
            ) : (
              "Submit registration"
            )}
          </Button>
          <p className="text-xs text-muted">
            Submitting a registration does not confirm admission or payment. We will contact you using the details you
            provide.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function ErrorBanner({ error }: { error: ApiError }) {
  const retryable = error.code === "NETWORK_ERROR" || error.status >= 500;
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">
          {retryable ? "We could not submit your registration" : "Please check your details"}
        </p>
        <p className="mt-1 text-muted">{error.message}</p>
        {error.requestId && (
          <p className="mt-1 font-mono text-xs text-muted/80">Reference: {error.requestId}</p>
        )}
        {retryable && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            Your input has been kept. You can safely try again.
          </p>
        )}
      </div>
    </div>
  );
}

function SuccessPanel({ receipt, onReset }: { receipt: RegistrationReceipt; onReset: () => void }) {
  return (
    <div className="container max-w-2xl py-20">
      <Card>
        <CardHeader className="items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-apple-blue/40 bg-apple-blue/10">
            <CheckCircle2 className="h-7 w-7 text-apple-blue" aria-hidden="true" />
          </span>
          <CardTitle className="mt-4 text-2xl">Registration received</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted">
            Thank you. Your registration has been received. We have sent a confirmation to your email address.
          </p>

          <div className="mt-6 rounded-[12px] border border-border bg-background-secondary p-4 text-left">
            <p className="text-xs uppercase tracking-wide text-muted">Your reference</p>
            <p className="mt-1 font-mono text-lg font-semibold text-apple-blue">{receipt.reference}</p>
            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Courses</dt>
                <dd className="text-foreground">
                  {receipt.courseIds.map((id) => COURSES.find((c) => c.id === id)?.name ?? id).join(", ")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Final price</dt>
                <dd className="font-semibold text-apple-blue">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
                    receipt.price.finalPrice,
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <p className="mt-5 text-xs text-muted">
            Please keep your reference for future correspondence. Submitting this registration does not confirm
            admission or payment.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={onReset} variant="outline">
              Submit another registration
            </Button>
            <Button asChild>
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
