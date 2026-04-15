import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../../api/http";
import { Button } from "../../components/common/Button";
import { SectionHeading } from "../../components/public/SectionHeading";

const initialForm = {
  firstName: "",
  lastName: "",
  birthday: "",
  gender: "PREFER_NOT_TO_SAY",
  maritalStatus: "PREFER_NOT_TO_SAY",
  createAccount: false,
  password: "",
  donationFrequency: "ONE_TIME",
  email: "",
  phone: "",
  country: "China",
  state: "",
  city: "",
  preferredLanguage: "zh-CN",
  donationAmount: 100,
  notes: "",
};

export function DonationPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        birthday: form.birthday || null,
        password: form.createAccount ? form.password : undefined,
      };

      await apiRequest("/public/donations", {
        method: "POST",
        body: JSON.stringify(payload),
        authMode: "none",
      });

      setForm(initialForm);
      navigate("/thank-you", {
        replace: true,
        state: {
          fromDonation: true,
          createdAccount: form.createAccount,
          donationFrequency: form.donationFrequency,
          donorName: `${form.firstName} ${form.lastName}`.trim(),
        },
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionHeading
            eyebrow="Donation form"
            title="Support Creators"
            description="This public form submits directly to the backend donation endpoint so the admin team can continue processing the donor journey, whether the gift is one-time or monthly."
          />
          <div className="mt-8 rounded-[2rem] bg-ink-950 p-7 text-white shadow-panel">
            <p className="text-sm uppercase tracking-[0.24em] text-gold-300">What happens next</p>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-white/80">
              <li>Donation is recorded as a receivable</li>
              <li>You can choose a one-time gift or monthly giving preference</li>
              <li>If you want, you can create your donor account at the same time</li>
              <li>Admin team can issue a receipt and prepare a kit</li>
              <li>Shipping and donor feedback can be tracked later</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2.5rem] bg-white/85 p-8 shadow-panel">
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              { key: "firstName", label: "First name" },
              { key: "lastName", label: "Last name" },
              { key: "email", label: "Email", type: "email" },
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

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink-900">Donation frequency</span>
              <select
                value={form.donationFrequency}
                onChange={(event) => setForm({ ...form, donationFrequency: event.target.value })}
                className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
              >
                <option value="ONE_TIME">One-time donation</option>
                <option value="MONTHLY">Monthly giving</option>
              </select>
            </label>
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
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-semibold text-ink-900">Donation amount</span>
            <input
              type="number"
              min="0"
              value={form.donationAmount}
              onChange={(event) => setForm({ ...form, donationAmount: Number(event.target.value) })}
              className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
            />
          </label>

          <div className="mt-5 rounded-[1.8rem] border border-ink-950/8 bg-cream-50/70 p-5">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={form.createAccount}
                onChange={(event) =>
                  setForm({
                    ...form,
                    createAccount: event.target.checked,
                    password: event.target.checked ? form.password : "",
                  })
                }
                className="mt-1 h-4 w-4 rounded border-ink-950/20 text-pine-800 focus:ring-pine-700"
              />
              <span>
                <span className="block text-sm font-semibold text-ink-900">Create an account with this donation</span>
                <span className="mt-1 block text-sm leading-6 text-ink-900/62">
                  Use your donation details to set up a donor account so you can come back later and view receipts, shipping, and feedback.
                </span>
              </span>
            </label>

            {form.createAccount ? (
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-semibold text-ink-900">Account password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="w-full rounded-2xl border border-ink-950/10 bg-white px-4 py-3 outline-none transition focus:border-pine-700"
                />
              </label>
            ) : null}
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-semibold text-ink-900">Message</span>
            <textarea
              rows="5"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
            />
          </label>

          {error ? <p className="mt-5 text-sm font-medium text-terracotta-600">{error}</p> : null}

          <div className="mt-8 flex flex-wrap gap-4">
            <Button type="submit" variant="accent" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit donation"}
            </Button>
            <Button as="a" href="#what-happens-next" variant="secondary">
              View thank-you page
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
