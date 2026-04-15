export function HorizontalBarList({ items, accent = "bg-pine-700" }) {
  if (!items.length) {
    return <div className="rounded-2xl bg-cream-50 px-5 py-8 text-sm text-ink-900/55">No data available.</div>;
  }

  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-ink-900">{item.label}</span>
            <span className="text-ink-900/58">{item.value}</span>
          </div>
          <div className="h-3 rounded-full bg-cream-50">
            <div
              className={`h-3 rounded-full ${accent}`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
