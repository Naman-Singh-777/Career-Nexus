const CIRC = 2 * Math.PI * 42;

export default function RadialRing({ value = 0, size = 96, label, color = "#8b7cf6" }) {
  const offset = CIRC - (Math.max(0, Math.min(100, value)) / 100) * CIRC;
  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s var(--ease-cinematic)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono-metric text-md leading-none">{Math.round(value)}</span>
        {label && <span className="text-[10px] uppercase tracking-widest text-ink-dim mt-1">{label}</span>}
      </div>
    </div>
  );
}
