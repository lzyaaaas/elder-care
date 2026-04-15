import { useEffect, useState } from "react";

import { apiRequest } from "../../api/http";
import { formatCurrency, formatDate } from "../../utils/format";

export function EmployeeDonationsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadItems() {
      try {
        const result = await apiRequest("/employee-portal/donations", { authMode: "employee" });
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
        My donation tasks
      </p>
      <h2 className="mt-4 text-2xl font-semibold text-ink-950">Donations currently assigned to you</h2>
      {error ? <p className="mt-6 text-sm font-medium text-terracotta-600">{error}</p> : null}
      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-ink-950/8 text-ink-900/55">
            <tr>
              <th className="pb-3 pr-4 font-semibold">Donation</th>
              <th className="pb-3 pr-4 font-semibold">Donor</th>
              <th className="pb-3 pr-4 font-semibold">Amount</th>
              <th className="pb-3 pr-4 font-semibold">Date</th>
              <th className="pb-3 pr-4 font-semibold">Event</th>
              <th className="pb-3 pr-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-ink-950/6">
                <td className="py-4 pr-4">{item.donationCode}</td>
                <td className="py-4 pr-4">
                  {item.donor ? `${item.donor.firstName} ${item.donor.lastName}` : "-"}
                </td>
                <td className="py-4 pr-4">{formatCurrency(item.donationAmount)}</td>
                <td className="py-4 pr-4">{formatDate(item.donationDate)}</td>
                <td className="py-4 pr-4">{item.event?.eventName || "-"}</td>
                <td className="py-4 pr-4">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && !error ? <p className="py-8 text-sm text-ink-900/55">No donation tasks yet.</p> : null}
      </div>
    </section>
  );
}
