import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout";
import { HomePage } from "./pages/HomePage";
import { Skeleton } from "./components/ui/skeleton";

/**
 * Public site router.
 *
 * The home page is loaded eagerly (it is the most common entry point); every
 * other route is code-split with React.lazy so the initial bundle stays small.
 *
 * NOTE: there is deliberately NO /admin or /admin/login route here. The private
 * admin application is a completely separate Vite app with its own router,
 * entry point and deployment target.
 */
const CoursesPage = lazy(() => import("./pages/CoursesPage").then((m) => ({ default: m.CoursesPage })));
const PricingPage = lazy(() => import("./pages/PricingPage").then((m) => ({ default: m.PricingPage })));
const AboutPage = lazy(() => import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const FaqPage = lazy(() => import("./pages/FaqPage").then((m) => ({ default: m.FaqPage })));
const EnrollPage = lazy(() => import("./pages/EnrollPage").then((m) => ({ default: m.EnrollPage })));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("./pages/TermsPage").then((m) => ({ default: m.TermsPage })));
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
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<Lazy><CoursesPage /></Lazy>} />
        <Route path="/pricing" element={<Lazy><PricingPage /></Lazy>} />
        <Route path="/about" element={<Lazy><AboutPage /></Lazy>} />
        <Route path="/faq" element={<Lazy><FaqPage /></Lazy>} />
        <Route path="/enroll" element={<Lazy><EnrollPage /></Lazy>} />
        <Route path="/privacy" element={<Lazy><PrivacyPage /></Lazy>} />
        <Route path="/terms" element={<Lazy><TermsPage /></Lazy>} />
        <Route path="*" element={<Lazy><NotFoundPage /></Lazy>} />
      </Route>
    </Routes>
  );
}

