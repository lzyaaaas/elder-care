import { useNavigate } from "react-router-dom";

import { Button } from "../common/Button";
import { clearSession, getSessionUser } from "../../utils/auth-storage";

export function AdminTopbar() {
  const navigate = useNavigate();
  const user = getSessionUser();

  function handleLogout() {
    clearSession();
    navigate("/admin/login");
  }

  return (
    <div className="flex flex-col gap-4 border-b border-ink-950/8 bg-white/60 px-5 py-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-900/45">
          Admin Workspace
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ink-950">Campaign operations dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-full bg-pine-700/10 px-4 py-2 text-sm text-pine-800">
          {user?.name || "Admin user"}
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </div>
  );
}
