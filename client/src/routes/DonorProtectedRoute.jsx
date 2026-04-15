import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getDonorToken } from "../utils/donor-auth-storage";

export function DonorProtectedRoute() {
  const location = useLocation();

  if (!getDonorToken()) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
