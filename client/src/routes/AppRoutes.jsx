import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "../layouts/AdminLayout";
import { DonorLayout } from "../layouts/DonorLayout";
import { EmployeeLayout } from "../layouts/EmployeeLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { DashboardPage } from "../pages/admin/DashboardPage";
import { LoginPage } from "../pages/admin/LoginPage";
import { ManagementPage } from "../pages/admin/ManagementPage";
import { DonorDonationsPage } from "../pages/donor/DonorDonationsPage";
import { DonorFeedbackPage } from "../pages/donor/DonorFeedbackPage";
import { DonorProfilePage } from "../pages/donor/DonorProfilePage";
import { DonorReceiptsPage } from "../pages/donor/DonorReceiptsPage";
import { DonorShippingPage } from "../pages/donor/DonorShippingPage";
import { EmployeeDashboardPage } from "../pages/employee/EmployeeDashboardPage";
import { EmployeeDonationsPage } from "../pages/employee/EmployeeDonationsPage";
import { EmployeeEventsPage } from "../pages/employee/EmployeeEventsPage";
import { EmployeeFollowUpsPage } from "../pages/employee/EmployeeFollowUpsPage";
import { EmployeeProfilePage } from "../pages/employee/EmployeeProfilePage";
import { EmployeeSchedulePage } from "../pages/employee/EmployeeSchedulePage";
import { EmployeeShippingTasksPage } from "../pages/employee/EmployeeShippingTasksPage";
import { AboutPage } from "../pages/public/AboutPage";
import { CausePage } from "../pages/public/CausePage";
import { DonorLoginPage } from "../pages/public/DonorLoginPage";
import { DonorRegisterPage } from "../pages/public/DonorRegisterPage";
import { DonationPage } from "../pages/public/DonationPage";
import { EmployeeLoginPage } from "../pages/public/EmployeeLoginPage";
import { FeedbackPage } from "../pages/public/FeedbackPage";
import { HomePage } from "../pages/public/HomePage";
import { StorybookPage } from "../pages/public/StorybookPage";
import { ThankYouPage } from "../pages/public/ThankYouPage";
import { DonorProtectedRoute } from "./DonorProtectedRoute";
import { EmployeeProtectedRoute } from "./EmployeeProtectedRoute";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<Navigate to="/our-story" replace />} />
        <Route path="/our-story" element={<AboutPage />} />
        <Route path="/the-cause" element={<CausePage />} />
        <Route path="/storybook" element={<Navigate to="/gifts" replace />} />
        <Route path="/gifts" element={<StorybookPage />} />
        <Route path="/donate" element={<DonationPage />} />
        <Route path="/sign-in" element={<DonorLoginPage />} />
        <Route path="/register" element={<DonorRegisterPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Route>

      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/employee/login" element={<EmployeeLoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/:moduleKey" element={<ManagementPage />} />
        </Route>
      </Route>

      <Route element={<DonorProtectedRoute />}>
        <Route element={<DonorLayout />}>
          <Route path="/my" element={<Navigate to="/my/profile" replace />} />
          <Route path="/my/profile" element={<DonorProfilePage />} />
          <Route path="/my/donations" element={<DonorDonationsPage />} />
          <Route path="/my/receipts" element={<DonorReceiptsPage />} />
          <Route path="/my/shipping" element={<DonorShippingPage />} />
          <Route path="/my/feedback" element={<DonorFeedbackPage />} />
        </Route>
      </Route>

      <Route element={<EmployeeProtectedRoute />}>
        <Route element={<EmployeeLayout />}>
          <Route path="/employee" element={<EmployeeDashboardPage />} />
          <Route path="/employee/profile" element={<EmployeeProfilePage />} />
          <Route path="/employee/schedule" element={<EmployeeSchedulePage />} />
          <Route path="/employee/events" element={<EmployeeEventsPage />} />
          <Route path="/employee/donations" element={<EmployeeDonationsPage />} />
          <Route path="/employee/shipping" element={<EmployeeShippingTasksPage />} />
          <Route path="/employee/follow-ups" element={<EmployeeFollowUpsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
