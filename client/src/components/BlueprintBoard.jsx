import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight, ExternalLink } from "lucide-react";
import StageShell from "./shared/StageShell.jsx";
import RadialRing from "./shared/RadialRing.jsx";
import { SkillRadar, CompatibilityBars } from "./Charts.jsx";

function money(n, currency = "USD") {
  if (n == null) return "n/a";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString()}`;
  }
}

function BlueprintCard({ bp, index, expanded, onToggle, onChoose }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="surface-glass w-full rounded-3xl p-7 text-left"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono-metric text-[10px] uppercase tracking-widest text-ink-dim">
            Blueprint {String(index + 1).padStart(2, "0")} · {bp.track === "advancement" ? "Advancement" : "Transition"}
          </span>
          <h3 className="font-display text-lg mt-1">{bp.title}</h3>
        </div>
        <RadialRing value={bp.compatibilityScore} label="fit" size={78} color="#5fd4d6" />
      </div>

      <p className="mt-4 text-sm text-ink-dim">{bp.narrative}</p>

      <div className="mt-5 flex flex-wrap gap-4 font-mono-metric text-xs text-ink-dim">
        <span>{money(bp.salaryRange?.min, bp.salaryRange?.currency)} to {money(bp.salaryRange?.max, bp.salaryRange?.currency)}</span>
        {bp.growthOutlook && <span className="text-signal-amber">{bp.growthOutlook}</span>}
      </div>

      <button
        onClick={onToggle}
        className="mt-6 flex items-center gap-1.5 text-xs uppercase tracking-widest text-ink-dim transition-colors hover:text-ink"
      >
        {expanded ? "Collapse" : "Expand blueprint"}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-6 grid grid-cols-1 gap-8 border-t border-white/5 pt-6 sm:grid-cols-2">
              <div className="flex flex-col items-center">
                <span className="mb-2 font-mono-metric text-[10px] uppercase tracking-widest text-ink-dim">
                  Skill Gap: You vs. Required
                </span>
                <SkillRadar data={bp.skillGap} />
                <div className="mt-2 flex gap-4 text-[10px] font-mono-metric text-ink-dim">
                  <span><span className="inline-block h-2 w-2 rounded-full bg-signal-cyan mr-1" />You</span>
                  <span><span className="inline-block h-2 w-2 rounded-full bg-signal-amber mr-1" />Required</span>
                </div>
              </div>
              <div>
                <span className="mb-3 block font-mono-metric text-[10px] uppercase tracking-widest text-ink-dim">
                  Industry Compatibility
                </span>
                <CompatibilityBars data={bp.industryCompatibility} />
                {bp.whyThisFits?.length > 0 && (
                  <ul className="mt-6 space-y-1.5 text-left text-xs text-ink-dim">
                    {bp.whyThisFits.map((w) => (
                      <li key={w} className="flex gap-2">
                        <span className="text-signal-violet">→</span> {w}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onChoose(bp)}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-mono-metric text-sm uppercase tracking-widest text-carbon"
        style={{ background: "linear-gradient(135deg, var(--violet), var(--cyan))" }}
      >
        Choose this path <ArrowRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}

export default function BlueprintBoard({ blueprints, sources, onChoose }) {
  const [expandedId, setExpandedId] = useState(0);

  return (
    <StageShell
      eyebrow="Stage 04, Creative Blueprint Board"
      title="Three paths, grounded in what's actually hiring right now."
      subtitle="Every score below comes from live research on this exact profile, not a generic ranking."
      wide
    >
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        {blueprints.map((bp, i) => (
          <BlueprintCard
            key={bp.title}
            bp={bp}
            index={i}
            expanded={expandedId === i}
            onToggle={() => setExpandedId(expandedId === i ? -1 : i)}
            onChoose={onChoose}
          />
        ))}
      </div>

      {sources?.length > 0 && (
        <div className="mt-10 flex flex-wrap justify-center gap-x-4 gap-y-2">
          {sources.slice(0, 6).map((s, i) => (
            <a
              key={i}
              href={s.uri}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-mono-metric text-[11px] text-ink-dim/70 hover:text-signal-cyan"
            >
              <ExternalLink className="h-3 w-3" /> {s.title || new URL(s.uri).hostname}
            </a>
          ))}
        </div>
      )}
    </StageShell>
  );
}
