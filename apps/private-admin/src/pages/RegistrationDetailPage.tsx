import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Check } from "lucide-react";
import type { RegistrationStatus } from "@cyberwolf/shared-types";
import { COURSES, degreeLabel, departmentLabel, studyYearLabel } from "@cyberwolf/shared-types";
import { formatINR } from "@cyberwolf/pricing";
import { adminApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";

const NEXT_STATUSES: RegistrationStatus[] = [
  "received",
  "under-review",
  "contacted",
  "confirmed",
  "declined",
  "cancelled",
];

export function RegistrationDetailPage() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["registration", id],
    queryFn: () => adminApi.getRegistration(id),
    enabled: Boolean(id),
  });

  const mutation = useMutation({
    mutationFn: (status: RegistrationStatus) => adminApi.updateStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["registration", id] });
      void queryClient.invalidateQueries({ queryKey: ["registrations"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  if (isLoading) return <Skeleton className="h-96" />;

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
          <p className="text-sm text-muted">{error instanceof Error ? error.message : "Registration not found."}</p>
          <Button asChild variant="outline">
            <Link to="/registrations">Back to registrations</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/registrations">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Registration detail</h1>
          <p className="font-mono text-sm text-apple-blue">{data.reference}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Student details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              <Field label="Full name" value={data.fullName} />
              <Field label="Email" value={data.email} />
              <Field label="Mobile" value={data.mobile} />
              <Field label="College / institution" value={data.college ?? "—"} />
              <Field label="Degree / programme" value={data.degree ? degreeLabel(data.degree) : "—"} />
              <Field label="Year of study" value={data.yearOfStudy ? studyYearLabel(data.yearOfStudy) : "—"} />
              <Field label="Department" value={data.department ? departmentLabel(data.department) : "—"} />
              <Field label="City" value={data.city ?? "—"} />
              <Field label="Status" value={<StatusBadge status={data.status} />} />
              <Field label="Received (UTC)" value={new Date(data.createdAt).toISOString().replace("T", " ").slice(0, 19)} />
              <Field label="Consent given" value={data.privacyConsent ? `Yes (${new Date(data.consentAt).toISOString().slice(0, 10)})` : "No"} />
              {data.message && (
                <div className="sm:col-span-2">
                  <dt className="text-muted">Message</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-foreground">{data.message}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Courses</span>
                <span className="text-foreground">{data.price.courseCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Original</span>
                <span className="text-foreground">{formatINR(data.price.originalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Discount</span>
                <span className="text-apple-blue">{formatINR(data.price.discount)}</span>
              </div>
              <div className="flex justify-between border-t border-border/70 pt-2">
                <span className="font-semibold text-foreground">Final</span>
                <span className="font-bold text-apple-blue">{formatINR(data.price.finalPrice)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selected courses</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm">
                {data.courseIds.map((cid) => (
                  <li key={cid} className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-apple-blue" aria-hidden="true" />
                    {COURSES.find((c) => c.id === cid)?.name ?? cid}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {NEXT_STATUSES.map((status) => (
            <Button
              key={status}
              variant={status === data.status ? "default" : "outline"}
              size="sm"
              disabled={mutation.isPending || status === data.status}
              onClick={() => mutation.mutate(status)}
            >
              {status.replace("-", " ")}
            </Button>
          ))}
          {mutation.isError && (
            <p role="alert" className="w-full text-sm text-destructive">
              Could not update status. {mutation.error instanceof Error ? mutation.error.message : ""}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}
