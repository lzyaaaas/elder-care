import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getSessionUser, getToken } from "../utils/auth-storage";

export function ProtectedRoute() {
  const location = useLocation();
  const user = getSessionUser();

  if (!getToken() || user?.accountType !== "ADMIN") {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
