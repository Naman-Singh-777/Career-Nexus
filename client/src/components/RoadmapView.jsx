import { motion } from "framer-motion";
import { Youtube, RotateCcw, Milestone } from "lucide-react";
import StageShell from "./shared/StageShell.jsx";

const STAGE_ACCENTS = ["#5fd4d6", "#8b7cf6", "#f2a65a", "#e8618c"];

export default function RoadmapView({ roadmap, onRestart }) {
  return (
    <StageShell
      eyebrow="Stage 05, Learning Pathway"
      title={roadmap.careerTitle}
      subtitle={roadmap.overview}
      wide
    >
      <div className="relative w-full max-w-3xl">
        <div
          className="absolute left-[15px] top-2 bottom-2 w-px sm:left-[19px]"
          style={{ background: "linear-gradient(180deg, var(--cyan), var(--violet), var(--amber), var(--rose))" }}
        />

        <div className="flex flex-col gap-14">
          {roadmap.stages.map((stage, si) => {
            const accent = STAGE_ACCENTS[si % STAGE_ACCENTS.length];
            return (
              <motion.div
                key={stage.stageName}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative pl-10 text-left sm:pl-12"
              >
                <div
                  className="absolute left-0 top-0.5 flex h-8 w-8 items-center justify-center rounded-full border sm:h-10 sm:w-10"
                  style={{ borderColor: accent, background: "var(--carbon)", color: accent }}
                >
                  <Milestone className="h-4 w-4" />
                </div>

                <div className="flex flex-wrap items-baseline gap-3">
                  <h3 className="font-display text-md">{stage.stageName}</h3>
                  {stage.durationWeeks && (
                    <span className="font-mono-metric text-[11px] uppercase tracking-widest text-ink-dim">
                      ~{stage.durationWeeks}w
                    </span>
                  )}
                </div>
                {stage.description && <p className="mt-1.5 text-sm text-ink-dim">{stage.description}</p>}

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {stage.topics.map((t) => (
                    <a
                      key={t.topic}
                      href={t.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="surface-glass group flex flex-col gap-2 rounded-2xl p-4 transition-transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-display text-sm leading-snug">{t.topic}</span>
                        <Youtube
                          className="h-4 w-4 shrink-0 text-ink-dim transition-colors group-hover:text-signal-rose"
                          strokeWidth={1.5}
                        />
                      </div>
                      {t.rationale && <p className="text-xs text-ink-dim">{t.rationale}</p>}
                      <span className="mt-1 font-mono-metric text-[10px] uppercase tracking-widest text-ink-dim/70">
                        Search YouTube: "{t.youtubeQuery}"
                      </span>
                    </a>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onRestart}
        className="mt-16 flex items-center gap-2 font-mono-metric text-xs uppercase tracking-widest text-ink-dim hover:text-ink"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Start a new scan
      </button>
    </StageShell>
  );
}
