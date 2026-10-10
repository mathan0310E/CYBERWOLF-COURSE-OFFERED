import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Users, IndianRupee, TrendingUp, ShieldCheck, RefreshCw, AlertTriangle } from "lucide-react";
import { adminApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatINR } from "@cyberwolf/pricing";

function StatCard({
  title,
  value,
  icon: Icon,
  hint,
}: {
  title: string;
  value: string;
  icon: typeof Users;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{title}</p>
          <Icon className="h-4 w-4 text-muted" aria-hidden="true" />
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
            <p className="text-sm text-muted">
              {error instanceof Error ? error.message : "Could not load dashboard statistics."}
            </p>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const confirmed = data.byStatus.confirmed ?? 0;
  const chartData = data.last7Days.map((d) => ({ ...d, label: d.date.slice(5) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total registrations" value={String(data.total)} icon={Users} />
        <StatCard title="Confirmed" value={String(confirmed)} icon={ShieldCheck} hint="Status set to confirmed" />
        <StatCard title="Indicative value" value={formatINR(data.revenue.received)} icon={IndianRupee} hint="Sum of received registrations" />
        <StatCard
          title="Confirmed value"
          value={formatINR(data.revenue.confirmed)}
          icon={TrendingUp}
          hint="Sum of confirmed registrations"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrations — last 7 days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#242B37" vertical={false} />
                <XAxis dataKey="label" stroke="#A4ADBB" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#A4ADBB" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#171D27", border: "1px solid #242B37", borderRadius: 8, color: "#F5F7FA" }}
                  labelStyle={{ color: "#A4ADBB" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.date} fill="#73F59B" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By status</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(data.byStatus).length === 0 ? (
              <p className="text-sm text-muted">No registrations yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {Object.entries(data.byStatus).map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between">
                    <span className="capitalize text-muted">{status.replace("-", " ")}</span>
                    <span className="font-medium text-foreground">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By course</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(data.byCourse).length === 0 ? (
              <p className="text-sm text-muted">No registrations yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {Object.entries(data.byCourse).map(([course, count]) => (
                  <li key={course} className="flex items-center justify-between">
                    <span className="text-muted">{course}</span>
                    <span className="font-medium text-foreground">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
