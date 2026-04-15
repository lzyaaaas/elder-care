import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { apiRequest } from "../../api/http";
import { Button } from "../../components/common/Button";
import { setSession } from "../../utils/auth-storage";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "admin@example.org",
    password: "admin123",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setSession(result.data);
      const accountType = result.data.user?.accountType;
      const requestedPath = location.state?.from?.pathname;
      const isRequestedPathValid =
        requestedPath &&
        ((accountType === "ADMIN" && requestedPath.startsWith("/admin")) ||
          (accountType === "EMPLOYEE" && requestedPath.startsWith("/employee")));
      const nextPath =
        requestedPath && isRequestedPathValid
          ? requestedPath
          : accountType === "ADMIN"
            ? "/admin"
            : "/employee";

      navigate(nextPath, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2.8rem] border border-white/60 bg-white/70 shadow-panel lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-ink-950 px-8 py-10 text-white sm:px-12 sm:py-14">
          <p className="text-xs uppercase tracking-[0.32em] text-gold-300">Admin entry</p>
          <h1 className="mt-6 font-display text-5xl leading-tight">Campaign control, with a cleaner operational view.</h1>
          <p className="mt-6 max-w-md text-base leading-8 text-white/76">
            Use the seeded admin credentials for the class demo, then continue into the dashboard
            shell and management modules.
          </p>
          <div className="mt-8 rounded-[1.6rem] bg-white/10 p-5 text-sm text-white/80">
            <p>Email: admin@example.org</p>
            <p className="mt-2">Password: admin123</p>
          </div>
        </div>

        <div className="px-8 py-10 sm:px-12 sm:py-14">
          <div className="max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pine-800">
              Sign in
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-ink-950">Admin login</h2>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink-900">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink-900">Password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
                />
              </label>

              {error ? <p className="text-sm font-medium text-terracotta-600">{error}</p> : null}

              <Button type="submit" variant="accent" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Enter dashboard"}
              </Button>
            </form>

            <Link to="/" className="mt-6 inline-block text-sm font-semibold text-ink-900/60">
              Return to public site
            </Link>
            <div className="mt-3">
              <Link to="/employee/login" className="text-sm font-semibold text-pine-800">
                Employee sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
