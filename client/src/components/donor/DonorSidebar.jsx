import { NavLink } from "react-router-dom";

const portalLinks = [
  { label: "Profile", path: "/my/profile" },
  { label: "My Donations", path: "/my/donations" },
  { label: "Receipts", path: "/my/receipts" },
  { label: "Shipping", path: "/my/shipping" },
  { label: "Feedback", path: "/my/feedback" },
];

export function DonorSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-ink-950/8 bg-white/82 px-6 py-8 xl:block">
      <div className="mb-10">
        <p className="font-display text-2xl text-ink-950">My Portal</p>
        <p className="mt-2 text-sm text-ink-900/60">Your donor and supporter records</p>
      </div>

      <nav className="space-y-2">
        {portalLinks.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-pine-800 text-white shadow-soft"
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
