import { Outlet } from "react-router-dom";

import { EmployeeSidebar } from "../components/employee/EmployeeSidebar";
import { EmployeeTopbar } from "../components/employee/EmployeeTopbar";

export function EmployeeLayout() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] text-ink-950">
      <div className="flex min-h-screen">
        <EmployeeSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <EmployeeTopbar />
          <div className="flex-1 px-5 py-6 sm:px-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
