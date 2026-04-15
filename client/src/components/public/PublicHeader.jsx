import { Link, NavLink, useNavigate } from "react-router-dom";

import { Button } from "../common/Button";
import { clearDonorSession, getDonorSessionUser } from "../../utils/donor-auth-storage";

const primaryLinks = [
  { kind: "route", to: "/", label: "Home" },
  { kind: "route", to: "/our-story", label: "Our Story" },
  { kind: "route", to: "/the-cause", label: "The Cause" },
  { kind: "route", to: "/gifts", label: "Gifts" },
  { kind: "route", to: "/donate", label: "Donate" },
  { kind: "route", to: "/feedback", label: "Feedback" },
];

export function PublicHeader() {
  const navigate = useNavigate();
  const donorUser = getDonorSessionUser();

  function handleSignOut() {
    clearDonorSession();
    navigate("/", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-950/6 bg-[#fbf7ef]/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-pine-800 to-ink-950 text-sm font-bold text-white shadow-soft">
            CR
          </div>
          <div>
            <p className="font-display text-xl text-ink-950">Creators</p>
            <p className="text-[11px] uppercase tracking-[0.28em] text-ink-900/52">
              Elder Care Foundation Campaign
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-ink-900 lg:flex">
          {primaryLinks.map((link) => {
            return link.kind === "route" ? (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? "text-pine-800" : "text-ink-900/74 transition hover:text-ink-950"
                }
              >
                {link.label}
              </NavLink>
            ) : (
              <a key={link.label} href={link.to} className="text-ink-900/74 transition hover:text-ink-950">
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {donorUser ? (
            <>
              <Link
                to="/my/profile"
                className="hidden text-sm font-medium text-ink-900/60 transition hover:text-ink-950 sm:block"
              >
                My Portal
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="hidden text-sm font-medium text-ink-900/38 transition hover:text-ink-900/68 sm:block"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="hidden text-sm font-medium text-ink-900/52 transition hover:text-ink-950 sm:block"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="hidden text-sm font-medium text-ink-900/38 transition hover:text-ink-900/68 md:block"
              >
                Register
              </Link>
            </>
          )}
          <Link
            to="/admin/login"
            className="hidden text-sm font-medium text-ink-900/38 transition hover:text-ink-900/68 sm:block"
          >
            Admin
          </Link>
          <Button as={Link} to="/donate" variant="accent" className="px-6">
            Donate Now
          </Button>
        </div>
      </div>
    </header>
  );
}
