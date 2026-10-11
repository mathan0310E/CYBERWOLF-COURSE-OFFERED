import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import { useAdminAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginPage() {
  const { signIn, sendReset, configured, error, clearError } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate("/", { replace: true });
    } catch {
      // error is surfaced through the auth context
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset() {
    if (!email) return;
    await sendReset(email);
    setResetSent(true);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <img
            src="/cyberwolf-logo.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-md object-contain"
            aria-hidden="true"
          />
          <CardTitle className="mt-3 text-xl">CyberWolf 360 Administration</CardTitle>
          <p className="text-sm text-muted">Restricted access. Authorised administrators only.</p>
        </CardHeader>
        <CardContent>
          {!configured && (
            <div role="alert" className="mb-4 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              <span>
                Firebase is not configured for the admin application. Set the VITE_ADMIN_* environment variables and
                rebuild.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                {error}
              </p>
            )}
            {resetSent && (
              <p className="text-sm text-apple-blue">If that account exists, a password reset email has been sent.</p>
            )}

            <Button type="submit" className="w-full" disabled={submitting || !configured}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <button
            type="button"
            onClick={handleReset}
            className="mt-4 w-full text-center text-xs text-muted underline underline-offset-2 hover:text-foreground"
          >
            Forgot password?
          </button>

          <p className="mt-6 text-center text-xs text-muted">
            There is no public administrator sign-up. Accounts are provisioned by a trusted script or in the Firebase
            console.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
