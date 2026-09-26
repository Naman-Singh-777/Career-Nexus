import { motion } from "framer-motion";
import { Compass, TrendingUp, AlertCircle } from "lucide-react";
import StageShell from "./shared/StageShell.jsx";

export default function DirectionStep({ profile, onChoose, error }) {
  return (
    <StageShell
      eyebrow="Stage 03, Direction"
      title={`We've read your background${profile?.currentRole ? ` in ${profile.currentRole}` : ""}.`}
      subtitle="Same profile, two very different engines. Which question should we answer?"
    >
      <div className="grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
        <motion.button
          whileHover={{ y: -6, scale: 1.02 }}
          onClick={() => onChoose("stay")}
          className="surface-glass flex flex-col items-start gap-4 rounded-3xl p-7 text-left"
        >
          <TrendingUp className="h-6 w-6 text-signal-amber" strokeWidth={1.5} />
          <div className="font-display text-md">Grow where I am</div>
          <p className="text-sm text-ink-dim">
            Show me the advancement lattice inside my current profile: what closes the
            gap to the next level, or a sharper specialization within it.
          </p>
        </motion.button>

        <motion.button
          whileHover={{ y: -6, scale: 1.02 }}
          onClick={() => onChoose("transition")}
          className="surface-glass flex flex-col items-start gap-4 rounded-3xl p-7 text-left"
        >
          <Compass className="h-6 w-6 text-signal-violet" strokeWidth={1.5} />
          <div className="font-display text-md">Chart a new path</div>
          <p className="text-sm text-ink-dim">
            Use what I already have as leverage. Show me real, adjacent careers I'm
            genuinely positioned to move into.
          </p>
        </motion.button>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-2 text-sm text-signal-rose">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
    </StageShell>
  );
}
