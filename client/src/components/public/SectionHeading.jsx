export function SectionHeading({ eyebrow, title, description, align = "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pine-800">{eyebrow}</p>
      ) : null}
      <h2 className="mt-4 font-display text-3xl leading-tight text-ink-950 sm:text-4xl">
        {title}
      </h2>
      {description ? <p className="mt-4 text-base leading-8 text-ink-900/72">{description}</p> : null}
    </div>
  );
}
