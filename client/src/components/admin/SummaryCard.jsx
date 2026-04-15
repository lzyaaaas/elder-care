export function SummaryCard({ label, value, helper }) {
  return (
    <div className="rounded-[1.75rem] border border-white/60 bg-white/85 p-6 shadow-soft">
      <p className="text-sm font-medium text-ink-900/55">{label}</p>
      <p className="mt-4 font-display text-4xl text-ink-950">{value}</p>
      <p className="mt-3 text-sm leading-6 text-ink-900/65">{helper}</p>
    </div>
  );
}
