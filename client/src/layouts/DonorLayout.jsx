import { Outlet } from "react-router-dom";

import { DonorSidebar } from "../components/donor/DonorSidebar";
import { DonorTopbar } from "../components/donor/DonorTopbar";

export function DonorLayout() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] text-ink-950">
      <div className="flex min-h-screen">
        <DonorSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <DonorTopbar />
          <div className="flex-1 px-5 py-6 sm:px-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
