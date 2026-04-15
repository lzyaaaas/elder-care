export function StatusBadge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-ink-950/8 text-ink-900",
    success: "bg-pine-700/12 text-pine-800",
    warning: "bg-gold-300/30 text-ink-950",
    danger: "bg-terracotta-500/12 text-terracotta-600",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
