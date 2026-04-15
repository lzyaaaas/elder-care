export function MetricStrip({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-[1.4rem] bg-cream-50 px-5 py-4">
          <p className="text-sm text-ink-900/55">{item.label}</p>
          <p className="mt-3 text-2xl font-semibold text-ink-950">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
