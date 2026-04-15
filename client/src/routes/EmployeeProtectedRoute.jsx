import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getSessionUser, getToken } from "../utils/auth-storage";

export function EmployeeProtectedRoute() {
  const location = useLocation();
  const token = getToken();
  const user = getSessionUser();

  if (!token || !user || !["ADMIN", "EMPLOYEE"].includes(user.accountType)) {
    return <Navigate to="/employee/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
