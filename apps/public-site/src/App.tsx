import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout";
import { HomePage } from "./pages/HomePage";
import { CoursesPage } from "./pages/CoursesPage";
import { PricingPage } from "./pages/PricingPage";
import { AboutPage } from "./pages/AboutPage";
import { FaqPage } from "./pages/FaqPage";
import { EnrollPage } from "./pages/EnrollPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

/**
 * Public site router.
 *
 * NOTE: there is deliberately NO /admin or /admin/login route here. The private
 * admin application is a completely separate Vite app with its own router,
 * entry point and deployment target.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/enroll" element={<EnrollPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
