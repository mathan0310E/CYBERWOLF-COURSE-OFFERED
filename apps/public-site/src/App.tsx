import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout";
import { HomePage } from "./pages/HomePage";
import { Skeleton } from "./components/ui/skeleton";
import { BootLoader } from "./components/fx/boot-loader";

/**
 * Public site router.
 *
 * The site is intentionally a single main page: Courses, Pricing, About and FAQ
 * are rendered as in-page sections (anchor targets) on the home route, not as
 * separate routes. Only the registration form has its own route (/enroll),
 * because it is a distinct task with its own form state and confirmation flow.
 * Legal documents (Privacy, Terms, Cookie Policy) open as dialogs on the main
 * page.
 *
 * NOTE: there is deliberately NO /admin or /admin/login route here. The private
 * admin application is a completely separate Vite app with its own router,
 * entry point and deployment target.
 */
const EnrollPage = lazy(() => import("./pages/EnrollPage").then((m) => ({ default: m.EnrollPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

function RouteFallback() {
  return (
    <div className="container space-y-4 py-16">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

export default function App() {
  return (
    <>
      <BootLoader />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/enroll" element={<Lazy><EnrollPage /></Lazy>} />
          <Route path="*" element={<Lazy><NotFoundPage /></Lazy>} />
        </Route>
      </Routes>
    </>
  );
}

