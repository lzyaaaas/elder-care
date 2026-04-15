import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiRequest } from "../../api/http";
import { Button } from "../../components/common/Button";
import { setDonorSession } from "../../utils/donor-auth-storage";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  birthday: "",
  gender: "PREFER_NOT_TO_SAY",
  maritalStatus: "PREFER_NOT_TO_SAY",
  phone: "",
  country: "China",
  state: "",
  city: "",
  preferredLanguage: "zh-CN",
  sourceEventId: "",
};

export function DonorRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [events, setEvents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        const result = await apiRequest("/public/events", { authMode: "none" });
        if (active) {
          setEvents(result.data || []);
        }
      } catch (_error) {
        if (active) {
          setEvents([]);
        }
      }
    }

    loadEvents();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        birthday: form.birthday || null,
        sourceEventId: form.sourceEventId ? Number(form.sourceEventId) : null,
      };

      const result = await apiRequest("/donor-auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
        authMode: "none",
      });

      setDonorSession(result.data);
      navigate("/my/profile", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-[2.8rem] border border-white/60 bg-white/75 shadow-panel lg:grid-cols-[0.92fr_1.08fr]">
        <div className="bg-[linear-gradient(180deg,#f5ebde_0%,#f0e5d5_46%,#e6efee_100%)] px-8 py-10 sm:px-12 sm:py-14">
          <p className="text-xs uppercase tracking-[0.32em] text-terracotta-600">Supporter registration</p>
          <h1 className="mt-6 font-display text-5xl leading-tight text-ink-950">Stay connected to the campaign, even before you donate.</h1>
          <p className="mt-6 max-w-md text-base leading-8 text-ink-900/70">
            Create a supporter account to follow your records, return later to donate, and let us know which event first brought you here.
          </p>
        </div>

        <div className="px-8 py-10 sm:px-12 sm:py-14">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pine-800">Create account</p>
            <h2 className="mt-4 text-3xl font-semibold text-ink-950">Register as a supporter or donor</h2>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  { key: "firstName", label: "First name" },
                  { key: "lastName", label: "Last name" },
                  { key: "email", label: "Email", type: "email" },
                  { key: "password", label: "Password", type: "password" },
                  { key: "birthday", label: "Birthday", type: "date" },
                  { key: "phone", label: "Phone" },
                  { key: "state", label: "State" },
                  { key: "city", label: "City" },
                ].map((field) => (
                  <label key={field.key} className="block">
                    <span className="mb-2 block text-sm font-semibold text-ink-900">{field.label}</span>
                    <input
                      type={field.type || "text"}
                      value={form[field.key]}
                      onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                      className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
                    />
                  </label>
                ))}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-ink-900">Gender</span>
                  <select
                    value={form.gender}
                    onChange={(event) => setForm({ ...form, gender: event.target.value })}
                    className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="NON_BINARY">Non-binary</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-ink-900">Marital status</span>
                  <select
                    value={form.maritalStatus}
                    onChange={(event) => setForm({ ...form, maritalStatus: event.target.value })}
                    className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
                  >
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-ink-900">Country</span>
                  <input
                    value={form.country}
                    onChange={(event) => setForm({ ...form, country: event.target.value })}
                    className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-ink-900">Preferred language</span>
                  <select
                    value={form.preferredLanguage}
                    onChange={(event) => setForm({ ...form, preferredLanguage: event.target.value })}
                    className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
                  >
                    <option value="zh-CN">Chinese</option>
                    <option value="en">English</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-ink-900">What brought you here?</span>
                  <select
                    value={form.sourceEventId}
                    onChange={(event) => setForm({ ...form, sourceEventId: event.target.value })}
                    className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
                  >
                    <option value="">No specific event</option>
                    {events.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.eventName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {error ? <p className="text-sm font-medium text-terracotta-600">{error}</p> : null}

              <Button type="submit" variant="accent" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
              <Link to="/sign-in" className="font-semibold text-pine-800">
                Already have an account?
              </Link>
              <Link to="/donate" className="font-semibold text-ink-900/60">
                Go to donation form
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
