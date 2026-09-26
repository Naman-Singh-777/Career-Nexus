import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Hand-drawn SVG radar chart. Gemini supplies the numbers (userLevel vs
 * requiredLevel per skill axis). This component only turns that data into
 * geometry. It never invents values.
 */
export function SkillRadar({ data = [], size = 320 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const n = Math.max(data.length, 3);

  const point = (value, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const dist = (Math.max(0, Math.min(100, value)) / 100) * r;
    return [cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist];
  };

  const userPath = useMemo(
    () => data.map((d, i) => point(d.userLevel, i)).map((p) => p.join(",")).join(" "),
    [data]
  );
  const reqPath = useMemo(
    () => data.map((d, i) => point(d.requiredLevel, i)).map((p) => p.join(",")).join(" "),
    [data]
  );

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height={size} className="max-w-sm">
      {rings.map((f) => (
        <polygon
          key={f}
          points={Array.from({ length: n })
            .map((_, i) => point(f * 100, i).join(","))
            .join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}
      {data.map((d, i) => {
        const [x, y] = point(100, i);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" />;
      })}

      <motion.polygon
        points={reqPath}
        fill="rgba(242,166,90,0.12)"
        stroke="rgba(242,166,90,0.6)"
        strokeWidth="1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <motion.polygon
        points={userPath}
        fill="rgba(95,212,214,0.18)"
        stroke="#5fd4d6"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      />

      {data.map((d, i) => {
        const [x, y] = point(112, i);
        return (
          <text
            key={d.skill}
            x={x}
            y={y}
            fontSize="9"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--ink-dim)"
            fontFamily="Space Mono, monospace"
          >
            {d.skill.length > 14 ? d.skill.slice(0, 13) + "…" : d.skill}
          </text>
        );
      })}
    </svg>
  );
}

export function CompatibilityBars({ data = [] }) {
  return (
    <div className="flex w-full flex-col gap-4">
      {data.map((d, i) => (
        <div key={d.factor}>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-mono-metric uppercase tracking-wider text-ink-dim">{d.factor}</span>
            <span className="font-mono-metric text-ink">{Math.round(d.score)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, var(--violet), var(--cyan))" }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, Math.min(100, d.score))}%` }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
