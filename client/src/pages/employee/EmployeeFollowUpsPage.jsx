import { useEffect, useState } from "react";

import { apiRequest } from "../../api/http";
import { formatDate } from "../../utils/format";

export function EmployeeFollowUpsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadItems() {
      try {
        const result = await apiRequest("/employee-portal/feedback", { authMode: "employee" });
        if (active) setItems(result.data || []);
      } catch (requestError) {
        if (active) setError(requestError.message);
      }
    }

    loadItems();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">
        My follow-ups
      </p>
      <h2 className="mt-4 text-2xl font-semibold text-ink-950">Feedback linked to donations you manage</h2>
      {error ? <p className="mt-6 text-sm font-medium text-terracotta-600">{error}</p> : null}
      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-[1.5rem] bg-cream-50 px-5 py-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-ink-900/58">
              <span>{item.donation?.donationCode || "-"}</span>
              <span>
                {item.donation?.donor
                  ? `${item.donation.donor.firstName} ${item.donation.donor.lastName}`
                  : "-"}
              </span>
              <span>{formatDate(item.feedbackDate)}</span>
              <span>{item.rating ? `${item.rating}/5` : "No rating"}</span>
              <span>{item.status}</span>
            </div>
            <p className="mt-3 text-base leading-7 text-ink-900/74">{item.feedbackContent}</p>
            <p className="mt-3 text-sm text-ink-900/58">
              Response: {item.responseContent || "No response recorded yet."}
            </p>
          </article>
        ))}
        {!items.length && !error ? <p className="text-sm text-ink-900/55">No follow-up items yet.</p> : null}
      </div>
    </section>
  );
}
