import { useEffect, useState } from "react";

import { apiRequest } from "../../api/http";
import { Button } from "../../components/common/Button";
import { formatDate } from "../../utils/format";

const initialForm = {
  donationId: "",
  rating: 5,
  feedbackContent: "",
};

export function DonorFeedbackPage() {
  const [items, setItems] = useState([]);
  const [donations, setDonations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData() {
    const [feedbackResult, donationResult] = await Promise.all([
      apiRequest("/donor-portal/feedback", { authMode: "donor" }),
      apiRequest("/donor-portal/donations", { authMode: "donor" }),
    ]);
    setItems(feedbackResult.data || []);
    setDonations(donationResult.data || []);
  }

  useEffect(() => {
    loadData().catch((requestError) => setError(requestError.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      await apiRequest("/donor-portal/feedback", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          donationId: Number(form.donationId),
        }),
        authMode: "donor",
      });
      setMessage("Feedback submitted.");
      setForm(initialForm);
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">Leave feedback</p>
        <h2 className="mt-4 text-2xl font-semibold text-ink-950">Tell us how the donor experience felt</h2>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink-900">Donation</span>
            <select
              value={form.donationId}
              onChange={(event) => setForm({ ...form, donationId: event.target.value })}
              className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
            >
              <option value="">Select donation</option>
              {donations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.donationCode}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink-900">Rating</span>
            <select
              value={form.rating}
              onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}
              className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} / 5
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink-900">Feedback</span>
            <textarea
              rows="5"
              value={form.feedbackContent}
              onChange={(event) => setForm({ ...form, feedbackContent: event.target.value })}
              className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
            />
          </label>

          {message ? <p className="text-sm font-medium text-pine-800">{message}</p> : null}
          {error ? <p className="text-sm font-medium text-terracotta-600">{error}</p> : null}

          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit feedback"}
          </Button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">Past feedback</p>
        <h2 className="mt-4 text-2xl font-semibold text-ink-950">Your submitted feedback</h2>
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-[1.5rem] bg-cream-50 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-ink-900/58">
                <span>{item.donation?.donationCode || "-"}</span>
                <span>{formatDate(item.feedbackDate)}</span>
                <span>{item.rating ? `${item.rating}/5` : "No rating"}</span>
              </div>
              <p className="mt-3 text-base leading-7 text-ink-900/74">{item.feedbackContent}</p>
            </article>
          ))}
          {!items.length ? <p className="text-sm text-ink-900/55">No feedback submitted yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
