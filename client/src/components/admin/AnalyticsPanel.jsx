export function AnalyticsPanel({ title, eyebrow, children, aside }) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
      <div className="flex flex-col gap-4 border-b border-ink-950/8 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 text-2xl font-semibold text-ink-950">{title}</h2>
        </div>
        {aside ? <div>{aside}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
