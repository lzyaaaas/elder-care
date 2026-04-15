import { useNavigate } from "react-router-dom";

import { Button } from "../common/Button";
import { clearDonorSession, getDonorSessionUser } from "../../utils/donor-auth-storage";

export function DonorTopbar() {
  const navigate = useNavigate();
  const donor = getDonorSessionUser();

  function handleLogout() {
    clearDonorSession();
    navigate("/", { replace: true });
  }

  return (
    <div className="flex flex-col gap-4 border-b border-ink-950/8 bg-white/60 px-5 py-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-900/45">Donor portal</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink-950">Welcome back{donor?.name ? `, ${donor.name.split(" ")[0]}` : ""}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-full bg-pine-700/10 px-4 py-2 text-sm text-pine-800">
          {donor?.supporterType === "DONOR" ? "Donor account" : "Supporter account"}
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
