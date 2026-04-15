function buildPoints(data, valueKey, width, height) {
  if (data.length === 0) {
    return "";
  }

  const maxValue = Math.max(...data.map((item) => Number(item[valueKey] || 0)), 1);
  const stepX = data.length > 1 ? width / (data.length - 1) : width / 2;

  return data
    .map((item, index) => {
      const x = index * stepX;
      const value = Number(item[valueKey] || 0);
      const y = height - (value / maxValue) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export function LineTrendChart({ data, valueKey = "value", labelKey = "label" }) {
  const width = 640;
  const height = 220;
  const points = buildPoints(data, valueKey, width, height);

  if (!data.length) {
    return <div className="rounded-2xl bg-cream-50 px-5 py-12 text-sm text-ink-900/55">No trend data yet.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] bg-cream-50 p-4">
        <svg viewBox={`0 0 ${width} ${height + 18}`} className="h-64 w-full">
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2d5b4f" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2d5b4f" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((step) => {
            const y = (height / 3) * step;
            return <line key={step} x1="0" y1={y} x2={width} y2={y} stroke="rgba(23,32,44,0.09)" />;
          })}
          <polyline fill="none" stroke="#2d5b4f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={points} />
          <polygon
            fill="url(#trend-fill)"
            points={`${points} ${width},${height} 0,${height}`}
          />
          {data.map((item, index) => {
            const maxValue = Math.max(...data.map((entry) => Number(entry[valueKey] || 0)), 1);
            const stepX = data.length > 1 ? width / (data.length - 1) : width / 2;
            const x = index * stepX;
            const y = height - (Number(item[valueKey] || 0) / maxValue) * height;

            return (
              <g key={`${item[labelKey]}-${index}`}>
                <circle cx={x} cy={y} r="5" fill="#c96d4c" />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {data.map((item) => (
          <div key={item[labelKey]} className="rounded-2xl bg-white px-4 py-3 text-sm shadow-soft">
            <p className="text-ink-900/52">{item[labelKey]}</p>
            <p className="mt-2 font-semibold text-ink-950">{item[valueKey]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
