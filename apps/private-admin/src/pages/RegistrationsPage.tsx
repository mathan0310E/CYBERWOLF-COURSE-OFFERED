import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, RefreshCw, Search, AlertTriangle, Inbox } from "lucide-react";
import type { Registration, RegistrationStatus } from "@cyberwolf/shared-types";
import { COURSES } from "@cyberwolf/shared-types";
import { formatINR } from "@cyberwolf/pricing";
import { adminApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";

const columnHelper = createColumnHelper<Registration>();

const STATUSES: Array<RegistrationStatus | ""> = [
  "",
  "received",
  "under-review",
  "contacted",
  "confirmed",
  "declined",
  "cancelled",
];

export function RegistrationsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RegistrationStatus | "">("");
  const [courseId, setCourseId] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"createdAt" | "fullName" | "finalPrice">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const pageSize = 25;

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["registrations", { search, status, courseId, page, sortBy, sortDir }],
    queryFn: () =>
      adminApi.listRegistrations({
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(courseId ? { courseId: courseId as never } : {}),
        page,
        pageSize,
        sortBy,
        sortDir,
      }),
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("reference", {
        header: "Reference",
        cell: (info) => (
          <Link to={`/registrations/${info.row.original.id}`} className="font-mono text-xs text-ink font-medium hover:underline">
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("fullName", { header: "Name" }),
      columnHelper.accessor("email", { header: "Email", cell: (info) => <span className="text-muted">{info.getValue()}</span> }),
      columnHelper.accessor("courseIds", {
        header: "Courses",
        cell: (info) =>
          info.getValue().map((id) => COURSES.find((c) => c.id === id)?.name ?? id).join(", "),
      }),
      columnHelper.accessor((row) => row.price.finalPrice, {
        id: "finalPrice",
        header: "Final price",
        cell: (info) => <span className="text-ink">{formatINR(info.getValue())}</span>,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("createdAt", {
        header: "Received (UTC)",
        cell: (info) => <span className="text-xs text-muted">{new Date(info.getValue()).toISOString().slice(0, 16).replace("T", " ")}</span>,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function toggleSort(next: "createdAt" | "fullName" | "finalPrice") {
    if (sortBy === next) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(next);
      setSortDir("desc");
    }
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Registrations</h1>
          <p className="text-sm text-muted">{total} record{total === 1 ? "" : "s"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[200px] flex-1">
            <label htmlFor="search" className="mb-1 block text-xs font-medium text-muted">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <Input
                id="search"
                className="pl-9"
                placeholder="Name, email, mobile, college or reference"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="mb-1 block text-xs font-medium text-muted">
              Status
            </label>
            <select
              id="status"
              className="h-11 rounded-md border border-input bg-background-secondary px-3 text-sm text-foreground"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as RegistrationStatus | "");
                setPage(1);
              }}
            >
              {STATUSES.map((s) => (
                <option key={s || "all"} value={s}>
                  {s ? s.replace("-", " ") : "All statuses"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="course" className="mb-1 block text-xs font-medium text-muted">
              Course
            </label>
            <select
              id="course"
              className="h-11 rounded-md border border-input bg-background-secondary px-3 text-sm text-foreground"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All courses</option>
              {COURSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("createdAt")}
              aria-label="Sort by received date"
            >
              Date {sortBy === "createdAt" && (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </Button>
            <Button variant="outline" size="sm" onClick={() => toggleSort("fullName")} aria-label="Sort by name">
              Name {sortBy === "fullName" && (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
            <p className="text-sm text-muted">{error instanceof Error ? error.message : "Could not load registrations."}</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (data?.items.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <Inbox className="h-6 w-6 text-muted" aria-hidden="true" />
            <p className="text-sm text-muted">No registrations match your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted">
            Page {page} of {totalPages}
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
    </div>
  );
}
