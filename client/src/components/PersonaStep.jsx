import { motion } from "framer-motion";
import { GraduationCap, Sparkles, Briefcase } from "lucide-react";
import StageShell from "./shared/StageShell.jsx";

const OPTIONS = [
  {
    id: "student",
    icon: GraduationCap,
    title: "Student",
    sub: "Exploring / summer internship",
    blurb: "You're mapping what's possible before you commit. We'll widen the lens.",
  },
  {
    id: "fresher",
    icon: Sparkles,
    title: "Fresher",
    sub: "0 to 1 years, first real role",
    blurb: "You've just started. We'll find the shortest honest path to traction.",
  },
  {
    id: "professional",
    icon: Briefcase,
    title: "Working Professional",
    sub: "Established in a role",
    blurb: "You have a track record. We'll use it for growth, or a real pivot.",
  },
];

export default function PersonaStep({ onChoose }) {
  return (
    <StageShell
      eyebrow="Stage 01, Calibration"
      title="Where are you, right now?"
      subtitle="This decides how the engine reads everything else. A summer intern and a ten-year engineer need different questions asked of the same resume."
    >
      <div className="grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3">
        {OPTIONS.map((opt, i) => (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => onChoose(opt.id)}
            className="surface-glass group flex flex-col items-start gap-4 rounded-3xl p-6 text-left transition-shadow hover:shadow-glow"
            style={{ "--tw-shadow-color": "rgba(139,124,246,0.18)" }}
          >
            <opt.icon className="h-6 w-6 text-signal-cyan" strokeWidth={1.5} />
            <div>
              <div className="font-display text-md">{opt.title}</div>
              <div className="font-mono-metric text-xs uppercase tracking-wider text-ink-dim">{opt.sub}</div>
            </div>
            <p className="text-sm text-ink-dim">{opt.blurb}</p>
          </motion.button>
        ))}
      </div>
    </StageShell>
  );
}
