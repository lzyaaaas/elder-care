function inputTypeFor(attribute, operator) {
  if (!attribute) {
    return "text";
  }

  if (operator === "between") {
    return attribute.type;
  }

  if (attribute.type === "enum") {
    return operator === "in" ? "text" : "select";
  }

  if (attribute.type === "boolean") {
    return "boolean";
  }

  if (attribute.type === "number" || attribute.type === "count") {
    return "number";
  }

  if (attribute.type === "date") {
    return "date";
  }

  return "text";
}

const operatorLabels = {
  equals: "Equals",
  in: "In list",
  contains: "Contains",
  gt: "Greater than",
  gte: "At least",
  lt: "Less than",
  eq: "Exactly",
  between: "Between",
  before: "Before",
  after: "After",
};

function ValueInput({ attribute, operator, value, onChange, isSecondary = false }) {
  const inputType = inputTypeFor(attribute, operator);
  const placeholder =
    operator === "in"
      ? "Comma-separated values"
      : isSecondary
        ? "End value"
        : "Value";

  if (inputType === "select") {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 text-sm outline-none transition focus:border-pine-700"
      >
        <option value="">Select value</option>
        {(attribute?.options || []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (inputType === "boolean") {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 text-sm outline-none transition focus:border-pine-700"
      >
        <option value="">Select value</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }

  return (
    <input
      type={inputType === "number" ? "number" : inputType}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 text-sm outline-none transition focus:border-pine-700"
    />
  );
}

export function AdvancedFilterPanel({
  attributes,
  filters,
  onAddFilter,
  onRemoveFilter,
  onUpdateFilter,
  onClearFilters,
}) {
  if (!attributes.length) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">Attributes / filters</p>
          <h3 className="mt-3 text-2xl font-semibold text-ink-950">Advanced filtering and linked analytics</h3>
          <p className="mt-3 text-sm leading-7 text-ink-900/64">
            Filter by local fields, linked records, and derived attributes such as donor age. Results refresh with
            updated counts and charts.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onAddFilter}
            className="rounded-full border border-pine-800/14 px-4 py-2 text-sm font-medium text-pine-900 transition hover:border-pine-800/32 hover:bg-pine-900/5"
          >
            Add condition
          </button>
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-full border border-ink-950/10 px-4 py-2 text-sm font-medium text-ink-900/68 transition hover:border-ink-950/22 hover:bg-ink-950/4"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {filters.length === 0 ? (
          <div className="rounded-[1.5rem] bg-cream-50 px-5 py-7 text-sm text-ink-900/58">
            No advanced conditions yet. Add a condition to filter by attribute and update the analytics summary.
          </div>
        ) : (
          filters.map((filter, index) => {
            const attribute = attributes.find((item) => item.key === filter.attribute);
            const operators = attribute?.operators || [];

            return (
              <div
                key={filter.id}
                className="grid gap-3 rounded-[1.5rem] bg-cream-50/90 p-4 lg:grid-cols-[1.3fr_1fr_1fr_auto]"
              >
                <select
                  value={filter.attribute}
                  onChange={(event) => onUpdateFilter(filter.id, "attribute", event.target.value)}
                  className="rounded-2xl border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-pine-700"
                >
                  <option value="">Choose attribute</option>
                  {attributes.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filter.operator}
                  onChange={(event) => onUpdateFilter(filter.id, "operator", event.target.value)}
                  disabled={!attribute}
                  className="rounded-2xl border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-pine-700 disabled:cursor-not-allowed disabled:bg-white/65"
                >
                  <option value="">Choose operator</option>
                  {operators.map((operator) => (
                    <option key={operator} value={operator}>
                      {operatorLabels[operator] || operator}
                    </option>
                  ))}
                </select>

                <div className={`grid gap-3 ${filter.operator === "between" ? "sm:grid-cols-2" : ""}`}>
                  <ValueInput
                    attribute={attribute}
                    operator={filter.operator}
                    value={filter.value}
                    onChange={(value) => onUpdateFilter(filter.id, "value", value)}
                  />
                  {filter.operator === "between" ? (
                    <ValueInput
                      attribute={attribute}
                      operator={filter.operator}
                      value={filter.valueTo}
                      onChange={(value) => onUpdateFilter(filter.id, "valueTo", value)}
                      isSecondary
                    />
                  ) : null}
                </div>

                <div className="flex items-start justify-end">
                  <button
                    type="button"
                    onClick={() => onRemoveFilter(filter.id)}
                    className="rounded-full border border-ink-950/10 px-4 py-2 text-sm font-medium text-ink-900/62 transition hover:border-ink-950/25 hover:bg-ink-950/4"
                  >
                    Remove
                  </button>
                </div>

                <div className="lg:col-span-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-900/42">Condition {index + 1}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
