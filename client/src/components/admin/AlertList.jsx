import { StatusBadge } from "../common/StatusBadge";

const toneBySeverity = {
  critical: "danger",
  high: "warning",
  medium: "neutral",
};

export function AlertList({ items }) {
  if (!items.length) {
    return <div className="rounded-2xl bg-cream-50 px-5 py-8 text-sm text-ink-900/55">No low-stock alerts right now.</div>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={`${item.type}-${item.name}`}
          className="flex flex-col gap-3 rounded-[1.5rem] border border-ink-950/8 bg-cream-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-ink-950">{item.name}</p>
            <p className="mt-1 text-sm text-ink-900/62">
              {item.type} inventory below target: {item.currentStock} on hand, reorder level {item.reorderLevel}
            </p>
          </div>
          <StatusBadge tone={toneBySeverity[item.severity] || "neutral"}>{item.severity}</StatusBadge>
        </div>
      ))}
    </div>
  );
}
