import { Outlet } from "react-router-dom";

import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminTopbar } from "../components/admin/AdminTopbar";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f3efe7] text-ink-950">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <AdminTopbar />
          <div className="flex-1 px-5 py-6 sm:px-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
