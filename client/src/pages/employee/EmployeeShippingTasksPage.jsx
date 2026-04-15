import { useEffect, useState } from "react";

import { apiRequest } from "../../api/http";
import { formatDate } from "../../utils/format";

export function EmployeeShippingTasksPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadItems() {
      try {
        const result = await apiRequest("/employee-portal/shippings", { authMode: "employee" });
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
        My shipping tasks
      </p>
      <h2 className="mt-4 text-2xl font-semibold text-ink-950">Shipping records tied to your donation work</h2>
      {error ? <p className="mt-6 text-sm font-medium text-terracotta-600">{error}</p> : null}
      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-ink-950/8 text-ink-900/55">
            <tr>
              <th className="pb-3 pr-4 font-semibold">Donation</th>
              <th className="pb-3 pr-4 font-semibold">Donor</th>
              <th className="pb-3 pr-4 font-semibold">Carrier</th>
              <th className="pb-3 pr-4 font-semibold">Tracking</th>
              <th className="pb-3 pr-4 font-semibold">Shipped</th>
              <th className="pb-3 pr-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-ink-950/6">
                <td className="py-4 pr-4">{item.donation?.donationCode || "-"}</td>
                <td className="py-4 pr-4">
                  {item.donation?.donor
                    ? `${item.donation.donor.firstName} ${item.donation.donor.lastName}`
                    : "-"}
                </td>
                <td className="py-4 pr-4">{item.carrier || "-"}</td>
                <td className="py-4 pr-4">{item.trackingNumber || "-"}</td>
                <td className="py-4 pr-4">{formatDate(item.shippedDate)}</td>
                <td className="py-4 pr-4">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && !error ? <p className="py-8 text-sm text-ink-900/55">No shipping tasks yet.</p> : null}
      </div>
    </section>
  );
}
