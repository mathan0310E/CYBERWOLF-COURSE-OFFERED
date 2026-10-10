import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx(Routes, { children: _jsxs(Route, { element: _jsx(Layout, {}), children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/courses", element: _jsx(CoursesPage, {}) }), _jsx(Route, { path: "/pricing", element: _jsx(PricingPage, {}) }), _jsx(Route, { path: "/about", element: _jsx(AboutPage, {}) }), _jsx(Route, { path: "/faq", element: _jsx(FaqPage, {}) }), _jsx(Route, { path: "/enroll", element: _jsx(EnrollPage, {}) }), _jsx(Route, { path: "/privacy", element: _jsx(PrivacyPage, {}) }), _jsx(Route, { path: "/terms", element: _jsx(TermsPage, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }) }));
}
