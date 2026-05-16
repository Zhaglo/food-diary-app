import { Navigate, Outlet } from "react-router";

import { useAuth } from "../context/AuthContext";

export default function PublicOnlyRoute() {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div className="page-state">Загрузка...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}