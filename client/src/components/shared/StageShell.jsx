import { motion } from "framer-motion";

/**
 * Shared "camera" wrapper for every non-hero stage: a consistent cinematic
 * entrance (scale + blur settle) instead of each stage hand-rolling its own
 * transition, plus the eyebrow / title / subtitle header pattern.
 */
export default function StageShell({ eyebrow, title, subtitle, children, wide = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-6 py-24 ${
        wide ? "max-w-6xl" : "max-w-3xl"
      } text-center`}
    >
      {eyebrow && (
        <span className="font-mono-metric text-xs uppercase tracking-[0.35em] text-signal-cyan/80">
          {eyebrow}
        </span>
      )}
      {title && (
        <h2 className="font-display text-lg sm:text-xl font-medium mt-4 max-w-2xl text-balance">{title}</h2>
      )}
      {subtitle && <p className="mt-4 max-w-xl text-sm text-ink-dim">{subtitle}</p>}
      <div className="mt-10 flex w-full flex-col items-center">{children}</div>
    </motion.div>
  );
}
