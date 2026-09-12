import type { DayCount } from "@/lib/crm/leads";

/** A small dependency-free bar chart — no charting library, just inline SVG sized to its container. */
export function LeadsTrendChart({ data, color = "#34d399", unit = "Leads" }: { data: DayCount[]; color?: string; unit?: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const w = 700;
  const h = 140;
  const padBottom = 22;
  const gap = 6;
  const barW = data.length ? (w - gap * (data.length - 1)) / data.length : 0;
  const summary = `${unit} per day, last ${data.length} days: ${data.map((d) => `${d.label} ${d.count}`).join(", ")}.`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={summary} className="h-32 w-full sm:h-36">
      <line x1="0" y1={h - padBottom} x2={w} y2={h - padBottom} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      {data.map((d, i) => {
        const barH = d.count === 0 ? 0 : Math.max(4, ((h - padBottom - 8) * d.count) / max);
        const x = i * (barW + gap);
        const y = h - padBottom - barH;
        return (
          <g key={d.date}>
            <rect x={x} y={y} width={barW} height={barH} rx={2} fill={d.count > 0 ? color : "rgba(255,255,255,0.08)"} />
            {(i === 0 || i === data.length - 1 || i % 2 === 0) && (
              <text x={x + barW / 2} y={h - 6} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.45)">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
