import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "./AdminLayout";
import loadingStyles from "./AdminLoading.module.css";

export default function ProtectedAdminLayout() {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <div className={loadingStyles.root}>Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <AdminLayout />;
}
