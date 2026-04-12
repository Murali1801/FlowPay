import { Navigate, Route, Routes } from "react-router-dom";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminDocsPage from "./pages/admin/AdminDocsPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminRegisterPage from "./pages/admin/AdminRegisterPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminTransactionsPage from "./pages/admin/AdminTransactionsPage";
import AdminWebsitesPage from "./pages/admin/AdminWebsitesPage";
import ProtectedAdminLayout from "./pages/admin/ProtectedAdminLayout";
import LandingPage from "./pages/LandingPage";
import SandboxPage from "./pages/SandboxPage";
import PaymentPage from "./pages/PaymentPage";
import SuccessPage from "./pages/SuccessPage";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/sandbox" element={<SandboxPage />} />
      <Route path="/pay/:orderId" element={<PaymentPage />} />
      <Route path="/success/:orderId" element={<SuccessPage />} />

      {/* Auth */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/register" element={<AdminRegisterPage />} />

      {/* Protected admin shell */}
      <Route path="/admin" element={<ProtectedAdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminTransactionsPage />} />
        <Route path="transactions" element={<Navigate to="/admin/orders" replace />} />
        <Route path="websites" element={<AdminWebsitesPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="docs" element={<AdminDocsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
