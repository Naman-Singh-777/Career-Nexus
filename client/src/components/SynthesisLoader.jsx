import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TICKER = [
  "cross-referencing skill taxonomy",
  "pulling live market signal",
  "scoring trajectory compatibility",
  "sequencing learning pathway",
  "rendering compatibility rings",
];

export default function SynthesisLoader({ label = "Synthesizing" }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % TICKER.length), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.div
        className="relative flex h-40 w-40 items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {[0, 1, 2].map((ring) => (
          <motion.span
            key={ring}
            className="absolute rounded-full border"
            style={{ borderColor: "rgba(139,124,246,0.35)" }}
            initial={{ width: 40, height: 40, opacity: 0.6 }}
            animate={{ width: [40, 160], height: [40, 160], opacity: [0.6, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: ring * 0.85, ease: "easeOut" }}
          />
        ))}
        <motion.div
          className="h-3 w-3 rounded-full bg-signal-cyan"
          animate={{ scale: [1, 1.6, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <div className="mt-10 font-display text-lg">{label}…</div>

      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="mt-3 font-mono-metric text-xs uppercase tracking-widest text-ink-dim"
        >
          {TICKER[i]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
