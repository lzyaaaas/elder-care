import { useEffect, useState } from "react";

import { apiRequest } from "../../api/http";
import { formatDate } from "../../utils/format";

export function EmployeeEventsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadItems() {
      try {
        const result = await apiRequest("/employee-portal/events", { authMode: "employee" });
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
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">My events</p>
      <h2 className="mt-4 text-2xl font-semibold text-ink-950">Campaign events assigned to you</h2>
      {error ? <p className="mt-6 text-sm font-medium text-terracotta-600">{error}</p> : null}

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-[1.6rem] border border-ink-950/8 bg-cream-50 px-5 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xl font-semibold text-ink-950">{item.eventName}</p>
                <p className="mt-2 text-sm text-ink-900/65">
                  {formatDate(item.startDate)} · {item.city || item.country || "-"} · {String(item.type || "").replace("_", " ")}
                </p>
              </div>
              <div className="rounded-full bg-ink-950/6 px-4 py-2 text-sm text-ink-950/72">
                {item.isActive ? "Active" : "Inactive"}
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-ink-900/72">{item.description || "No extra event notes."}</p>
            <p className="mt-4 text-sm text-ink-900/58">
              Scheduled shifts linked: {item.schedules?.length || 0}
            </p>
          </article>
        ))}
        {!items.length && !error ? <p className="py-8 text-sm text-ink-900/55">No assigned events yet.</p> : null}
      </div>
    </section>
  );
}
