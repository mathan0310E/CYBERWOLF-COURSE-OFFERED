import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useAdminAuth } from "./lib/auth";
import { AdminLayout } from "./components/admin-layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RegistrationsPage } from "./pages/RegistrationsPage";
import { RegistrationDetailPage } from "./pages/RegistrationDetailPage";
import { AuditPage } from "./pages/AuditPage";
import { EmailsPage } from "./pages/EmailsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";

/**
 * Route guard enforcing BOTH authentication and the server-set admin claim.
 * A signed-in non-admin account is denied access, matching the backend.
 */
function RequireAdmin() {
  const { user, loading, isAdmin } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-neon" aria-label="Loading" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <ShieldAlert className="h-7 w-7 text-destructive" aria-hidden="true" />
            <h1 className="text-lg font-semibold">Access denied</h1>
            <p className="text-sm text-muted">
              This account is signed in but does not have administrator privileges. Administrators are provisioned by a
              trusted script or in the Firebase console.
            </p>
            <Button asChild variant="outline">
              <a href="/login">Return to sign in</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Outlet />;
}

/**
 * Private admin router. This application is entirely separate from the public
 * site: its own entry point, routes, bundle and deployment target.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/registrations" element={<RegistrationsPage />} />
          <Route path="/registrations/:id" element={<RegistrationDetailPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/emails" element={<EmailsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
