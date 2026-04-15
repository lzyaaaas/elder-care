export function Button({
  children,
  className = "",
  variant = "primary",
  as: Component = "button",
  ...props
}) {
  const variants = {
    primary:
      "bg-ink-950 text-white hover:bg-pine-800 focus-visible:outline-pine-700",
    secondary:
      "bg-white/80 text-ink-950 ring-1 ring-ink-950/10 hover:bg-white focus-visible:outline-terracotta-500",
    accent:
      "bg-terracotta-500 text-white hover:bg-terracotta-600 focus-visible:outline-terracotta-500",
    ghost:
      "bg-transparent text-ink-950 hover:bg-ink-950/5 focus-visible:outline-ink-950",
  };

  return (
    <Component
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
