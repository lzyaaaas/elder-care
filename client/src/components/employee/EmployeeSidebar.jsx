import { NavLink } from "react-router-dom";

const employeeLinks = [
  { label: "My Dashboard", path: "/employee" },
  { label: "My Profile", path: "/employee/profile" },
  { label: "My Schedule", path: "/employee/schedule" },
  { label: "My Events", path: "/employee/events" },
  { label: "My Donation Tasks", path: "/employee/donations" },
  { label: "My Shipping Tasks", path: "/employee/shipping" },
  { label: "My Follow-ups", path: "/employee/follow-ups" },
];

export function EmployeeSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-ink-950/8 bg-white/78 px-6 py-8 xl:block">
      <div className="mb-10">
        <p className="font-display text-2xl text-ink-950">My Workspace</p>
        <p className="mt-2 text-sm text-ink-900/60">
          Personal details, shift visibility, and upcoming event support.
        </p>
      </div>

      <nav className="space-y-2">
        {employeeLinks.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/employee"}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-ink-950 text-white shadow-soft"
                  : "text-ink-900/70 hover:bg-cream-50 hover:text-ink-950"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
