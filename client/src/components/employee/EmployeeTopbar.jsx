import { useNavigate } from "react-router-dom";

import { clearSession, getSessionUser } from "../../utils/auth-storage";
import { Button } from "../common/Button";

export function EmployeeTopbar() {
  const navigate = useNavigate();
  const employee = getSessionUser();

  function handleLogout() {
    clearSession();
    navigate("/employee/login", { replace: true });
  }

  return (
    <div className="flex flex-col gap-4 border-b border-ink-950/8 bg-white/60 px-5 py-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-900/45">
          Employee portal
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ink-950">
          Welcome back{employee?.name ? `, ${employee.name.split(" ")[0]}` : ""}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-full bg-ink-950/6 px-4 py-2 text-sm text-ink-950/72">
          {employee?.role || "Team member"}
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
