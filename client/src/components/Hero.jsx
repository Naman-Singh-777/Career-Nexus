import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function Hero({ onBegin }) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="font-mono-metric text-xs uppercase tracking-[0.35em] text-signal-cyan/80"
      >
        Career Nexus, Reasoning Engine v2
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="font-display text-3xl font-medium leading-[0.98] text-balance mt-6 max-w-4xl"
      >
        Deconstruct
        <br />
        <span className="italic text-ink-dim">Your Trajectory.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
        className="mt-7 max-w-xl text-base text-ink-dim"
      >
        One resume. A reasoning engine that reads it the way a mentor would,
        then maps the real paths open to you, the exact gaps between here and
        there, and the order in which to close them.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
        whileHover={{ scale: 1.045 }}
        whileTap={{ scale: 0.97 }}
        onClick={onBegin}
        className="edge-glow surface-glass group mt-12 flex items-center gap-3 rounded-full px-7 py-4 font-mono-metric text-sm uppercase tracking-widest text-ink transition-shadow"
        style={{ "--glow-color": "rgba(139,124,246,0.35)" }}
      >
        Begin the scan
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 1 }}
        className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 font-mono-metric text-[11px] tracking-[0.3em] text-ink-dim/60"
      >
        SCROLL / CLICK TO INITIATE
      </motion.div>
    </div>
  );
}
