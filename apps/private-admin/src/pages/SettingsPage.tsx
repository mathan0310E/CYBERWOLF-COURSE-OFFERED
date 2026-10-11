import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { adminApi, API_BASE_URL } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Row({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-apple-blue" aria-hidden="true" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
      )}
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {detail && <p className="text-xs text-muted">{detail}</p>}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { user, isAdmin, configured } = useAdminAuth();
  const { data: session, isError, error } = useQuery({
    queryKey: ["session"],
    queryFn: () => adminApi.session(),
    retry: false,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60">
          <Row ok={configured} label="Firebase configured" detail={configured ? "Admin Firebase app initialised." : "Set VITE_ADMIN_* variables."} />
          <Row ok={Boolean(user)} label="Signed in" detail={user?.email ?? "No active session"} />
          <Row
            ok={isAdmin}
            label="Administrator claim present"
            detail={isAdmin ? "The ID token carries the admin custom claim." : "This account is not an administrator."}
          />
          <Row
            ok={Boolean(session)}
            label="Backend authorises this session"
            detail={isError ? (error instanceof Error ? error.message : "Backend check failed") : "Verified server-side."}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            <p className="text-muted">
              Authentication method: <span className="text-foreground">Firebase Authentication email/password</span>. No
              second factor is configured by default. Multi-factor authentication is not claimed to be active.
            </p>
          </div>
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-muted">API base URL</dt>
              <dd className="break-all font-mono text-xs text-foreground">{API_BASE_URL}</dd>
            </div>
            <div>
              <dt className="text-muted">Admin account</dt>
              <dd className="font-mono text-xs text-foreground">{user?.email ?? "—"}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted">
            SMTP credentials, service-account keys and other secrets are held only on the server. They are never present
            in this bundle or displayed here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Higher-risk actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted">
          <p>
            Data exports require a recently authenticated session (a fresh ID token). If your session is old, sign out
            and sign in again before exporting.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
