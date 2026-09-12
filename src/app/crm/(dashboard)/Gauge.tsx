/** A half-circle speedometer-style dial. Purely decorative fill (value/max), not a real target. */
export function Gauge({ value, max, display, sublabel }: { value: number; max: number; display: string; sublabel?: string }) {
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const r = 40;
  const circumference = Math.PI * r;
  const dash = circumference * pct;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 58" className="w-full max-w-[160px]">
        <path d="M 10 52 A 40 40 0 0 1 90 52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" strokeLinecap="round" />
        <path
          d="M 10 52 A 40 40 0 0 1 90 52"
          fill="none"
          stroke="#a3e635"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="-mt-5 text-center">
        <div className="font-display text-xl font-bold text-lime-400">{display}</div>
        {sublabel && <div className="mt-0.5 text-xs text-white/40">{sublabel}</div>}
      </div>
    </div>
  );
}

/** A friendly, non-literal scale so the dial never sits pinned at empty or completely full. */
export function gaugeScale(value: number) {
  return Math.max(10, Math.ceil((value * 1.6 || 10) / 10) * 10);
}
