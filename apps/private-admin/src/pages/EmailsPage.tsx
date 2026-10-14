import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, RotateCw, AlertTriangle, Inbox, Send } from "lucide-react";
import { adminApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmailStatusBadge } from "@/components/status-badge";

export function EmailsPage() {
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["emails"],
    queryFn: () => adminApi.emails(),
    refetchInterval: 20_000,
  });

  const retry = useMutation({
    mutationFn: (jobId: string) => adminApi.retryEmail(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["emails"] });
      setNotice("Retry requested. The original notification job was reused.");
    },
  });

  const process = useMutation({
    mutationFn: () => adminApi.processEmails(),
    onSuccess: (outcome) => {
      void queryClient.invalidateQueries({ queryKey: ["emails"] });
      setNotice(`Processed ${outcome.processed}, accepted ${outcome.sent}, failed ${outcome.failed}.`);
    },
  });

  const jobs = data?.jobs ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Email Activity</h1>
          <p className="text-sm text-muted">
            Durable notification jobs. SMTP acceptance is recorded as &ldquo;accepted&rdquo;, not confirmation of delivery.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => process.mutate()} disabled={process.isPending}>
            <Send className="h-4 w-4" aria-hidden="true" /> Process queue
          </Button>
        </div>
      </div>

      {notice && (
        <p role="status" className="rounded-md border border-border bg-sky p-3 text-sm text-ink">
          {notice}
        </p>
      )}
      {retry.isError && (
        <p role="alert" className="text-sm text-destructive">
          Retry failed: {retry.error instanceof Error ? retry.error.message : "unknown error"}
        </p>
      )}

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
            <p className="text-sm text-muted">{error instanceof Error ? error.message : "Could not load email activity."}</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <Inbox className="h-6 w-6 text-muted" aria-hidden="true" />
            <p className="text-sm text-muted">
              No email jobs yet. If email is not configured, registrations are still stored and jobs are created once
              SMTP is configured.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Last attempt (UTC)</TableHead>
                <TableHead>Error</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono text-xs text-muted">{job.registrationId.slice(0, 12)}</TableCell>
                  <TableCell>
                    <span className="text-xs text-muted">{job.recipientType}</span>
                    <br />
                    <span className="font-mono text-xs">{job.maskedRecipient}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{job.template}</TableCell>
                  <TableCell>
                    <EmailStatusBadge status={job.status} />
                  </TableCell>
                  <TableCell className="text-sm">{job.attemptCount}</TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-muted">
                    {job.lastAttemptAt ? job.lastAttemptAt.replace("T", " ").slice(0, 19) : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted">{job.lastErrorCategory ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={retry.isPending}
                      onClick={() => retry.mutate(job.id)}
                    >
                      <RotateCw className="h-3 w-3" aria-hidden="true" /> Retry
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
