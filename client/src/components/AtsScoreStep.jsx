import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import StageShell from "./shared/StageShell.jsx";
import RadialRing from "./shared/RadialRing.jsx";

export default function AtsScoreStep({ profile, onContinue }) {
  const ats = profile?.atsScore;
  const overall = ats?.overall ?? 0;

  return (
    <StageShell
      eyebrow="Stage 02, Compatibility Score"
      title="Here is how your resume reads to a machine."
      subtitle="Before we get to careers, this is a read of the document itself: how cleanly an applicant tracking system would parse it, independent of any single job posting."
    >
      <div className="flex flex-col items-center gap-8">
        <RadialRing value={overall} size={140} color="#5fd4d6" label="ATS score" />

        {ats?.factors?.length > 0 && (
          <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
            {ats.factors.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.5 }}
                className="surface-glass rounded-2xl p-5 text-left"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-sm">{f.name}</span>
                  <span className="font-mono-metric text-xs text-signal-cyan">{Math.round(f.score)}</span>
                </div>
                {f.note && <p className="mt-2 text-xs text-ink-dim">{f.note}</p>}
              </motion.div>
            ))}
          </div>
        )}

        {profile?.summary && <p className="max-w-xl text-sm text-ink-dim">{profile.summary}</p>}
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="edge-glow mt-10 flex items-center gap-2 rounded-full px-8 py-3.5 font-mono-metric text-sm uppercase tracking-widest text-carbon"
        style={{
          background: "linear-gradient(135deg, var(--violet), var(--cyan))",
          "--glow-color": "rgba(95,212,214,0.3)",
        }}
      >
        Continue <ArrowRight className="h-4 w-4" />
      </motion.button>
    </StageShell>
  );
}
