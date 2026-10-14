import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, RefreshCw, Search, AlertTriangle, Inbox } from "lucide-react";
import { adminApi, downloadAuthenticated } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CATEGORIES = ["audit", "registration", "admin", "security", "email", "errors"] as const;
const ACTOR_TYPES = ["", "admin", "registrant", "visitor", "system"] as const;
const RESULTS = ["", "SUCCESS", "FAILURE", "DENIED"] as const;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AuditPage() {
  const [date, setDate] = useState(todayIso());
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("audit");
  const [actorType, setActorType] = useState<(typeof ACTOR_TYPES)[number]>("");
  const [result, setResult] = useState<(typeof RESULTS)[number]>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showRaw, setShowRaw] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const pageSize = 50;

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["audit", { date, category, actorType, result, search, page }],
    queryFn: () =>
      adminApi.audit({
        date,
        category,
        ...(actorType ? { actorType } : {}),
        ...(result ? { result } : {}),
        ...(search ? { search } : {}),
        page,
        pageSize,
      }),
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function downloadOriginal() {
    void downloadAuthenticated(
      `/api/admin/audit/download?date=${encodeURIComponent(date)}&category=${encodeURIComponent(category)}`,
      `${category}-${date}.txt`,
    ).catch((err) => setExportError(err instanceof Error ? err.message : "Download failed."));
  }

  function exportFiltered() {
    // Filtered export is produced server-side through the authenticated export
    // endpoint, which also records the export in the audit log.
    void downloadAuthenticated("/api/admin/export", `cyberwolf-audit-${date}.txt`).catch((err) =>
      setExportError(err instanceof Error ? err.message : "Export failed."),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Audit Logs</h1>
          <p className="text-sm text-muted">Plain-text audit files stored in Cloud Storage.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={downloadOriginal}>
            <Download className="h-4 w-4" aria-hidden="true" /> Download TXT
          </Button>
          <Button variant="outline" size="sm" onClick={exportFiltered}>
            <FileText className="h-4 w-4" aria-hidden="true" /> Export
          </Button>
        </div>
      </div>

      {exportError && (
        <p role="alert" className="text-sm text-destructive">
          {exportError}
        </p>
      )}

      {data?.writeFailures && (
        <div className="flex items-start gap-2 rounded-md border border-[#FFE0B2] bg-[#FFF7E6] p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B26A00]" aria-hidden="true" />
          <span>
            No manifest exists for this day yet, so some log writes may still be queued for retry. Queued events are
            reconciled automatically.
          </span>
        </div>
      )}

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div>
            <label htmlFor="audit-date" className="mb-1 block text-xs font-medium text-muted">
              Date
            </label>
            <Input
              id="audit-date"
              type="date"
              value={date}
              max={todayIso()}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div>
            <label htmlFor="audit-category" className="mb-1 block text-xs font-medium text-muted">
              Category
            </label>
            <select
              id="audit-category"
              className="h-11 rounded-md border border-input bg-background-secondary px-3 text-sm text-foreground"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as (typeof CATEGORIES)[number]);
                setPage(1);
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="audit-actor" className="mb-1 block text-xs font-medium text-muted">
              Actor
            </label>
            <select
              id="audit-actor"
              className="h-11 rounded-md border border-input bg-background-secondary px-3 text-sm text-foreground"
              value={actorType}
              onChange={(e) => {
                setActorType(e.target.value as (typeof ACTOR_TYPES)[number]);
                setPage(1);
              }}
            >
              {ACTOR_TYPES.map((a) => (
                <option key={a || "all"} value={a}>
                  {a || "All actors"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="audit-result" className="mb-1 block text-xs font-medium text-muted">
              Result
            </label>
            <select
              id="audit-result"
              className="h-11 rounded-md border border-input bg-background-secondary px-3 text-sm text-foreground"
              value={result}
              onChange={(e) => {
                setResult(e.target.value as (typeof RESULTS)[number]);
                setPage(1);
              }}
            >
              {RESULTS.map((r) => (
                <option key={r || "all"} value={r}>
                  {r || "All results"}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[220px] flex-1">
            <label htmlFor="audit-search" className="mb-1 block text-xs font-medium text-muted">
              Search action or resource
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <Input
                id="audit-search"
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g. registration.created"
              />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowRaw((s) => !s)}>
            {showRaw ? "Hide" : "View"} original TXT
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
            <p className="text-sm text-muted">{error instanceof Error ? error.message : "Could not load audit logs."}</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {showRaw && (
            <Card>
              <CardHeader>
                <CardTitle>Original TXT — {category}-{date}.txt</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="max-h-96 overflow-auto rounded-md border border-border bg-background p-4 font-mono text-xs text-muted">
                  {data?.raw?.trim() ? data.raw : "No audit content for this date and category."}
                </pre>
              </CardContent>
            </Card>
          )}

          {(data?.events.length ?? 0) === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <Inbox className="h-6 w-6 text-muted" aria-hidden="true" />
                <p className="text-sm text-muted">No audit events for this selection.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp (UTC)</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.events.map((event) => (
                    <TableRow key={event.eventId || `${event.timestamp}-${event.action}`}>
                      <TableCell className="whitespace-nowrap font-mono text-xs text-muted">
                        {event.timestamp.replace("T", " ").slice(0, 19)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{event.action}</TableCell>
                      <TableCell className="text-xs text-muted">
                        {event.actorType}
                        <br />
                        <span className="font-mono">{event.actorId.slice(0, 20)}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted">
                        {event.resourceType}
                        <br />
                        <span className="font-mono">{event.resourceId.slice(0, 24)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            event.result === "SUCCESS" ? "default" : event.result === "DENIED" ? "destructive" : "outline"
                          }
                        >
                          {event.result}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-muted" title={event.details}>
                        {event.details}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {total > 0 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted">
                Page {page} of {totalPages} — {total} events
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
