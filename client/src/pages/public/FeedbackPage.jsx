import { useState } from "react";

import { apiRequest } from "../../api/http";
import { Button } from "../../components/common/Button";
import { SectionHeading } from "../../components/public/SectionHeading";

const initialForm = {
  donationCode: "",
  feedbackContent: "",
  rating: 5,
};

export function FeedbackPage() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      await apiRequest("/public/feedback", {
        method: "POST",
        body: JSON.stringify(form),
        authMode: "none",
      });
      setMessage("Feedback submitted. Thank you for helping improve the campaign experience.");
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Feedback"
        title="Tell us how the campaign experience felt"
        description="This form connects to the feedback endpoint so donor reactions can be tracked alongside donations and shipping outcomes."
        align="center"
      />

      <form onSubmit={handleSubmit} className="mx-auto mt-12 max-w-3xl rounded-[2.5rem] bg-white/85 p-8 shadow-panel">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink-900">Donation code</span>
          <input
            value={form.donationCode}
            onChange={(event) => setForm({ ...form, donationCode: event.target.value })}
            className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
            placeholder="Example: DR-DEMO-001"
          />
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold text-ink-900">Rating</span>
          <select
            value={form.rating}
            onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}
            className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
          >
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} / 5
              </option>
            ))}
          </select>
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold text-ink-900">Your feedback</span>
          <textarea
            rows="6"
            value={form.feedbackContent}
            onChange={(event) => setForm({ ...form, feedbackContent: event.target.value })}
            className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
          />
        </label>

        {message ? <p className="mt-5 text-sm font-medium text-pine-800">{message}</p> : null}
        {error ? <p className="mt-5 text-sm font-medium text-terracotta-600">{error}</p> : null}

        <div className="mt-8">
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit feedback"}
          </Button>
        </div>
      </form>
    </div>
  );
}
