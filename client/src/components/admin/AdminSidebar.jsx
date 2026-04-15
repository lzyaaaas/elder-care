import { NavLink } from "react-router-dom";

import { adminNavItems } from "../../data/admin-nav";

export function AdminSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-ink-950/8 bg-white/80 px-6 py-8 xl:block">
      <div className="mb-10">
        <p className="font-display text-2xl text-ink-950">Creators Ops</p>
        <p className="mt-2 text-sm text-ink-900/60">Campaign management workspace</p>
      </div>

      <nav className="space-y-2">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
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
