import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileUp, FileText, AlertCircle } from "lucide-react";
import StageShell from "./shared/StageShell.jsx";

// Matched against the file name since browsers are inconsistent about what
// they report in f.type for anything that isn't a PDF, DOC and TXT in
// particular often come through as a generic application/octet-stream.
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt"];

function hasAcceptedExtension(name) {
  const lower = (name || "").toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export default function ResumeStep({ onSubmit, error }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [rejected, setRejected] = useState(false);
  const inputRef = useRef(null);

  const accept = useCallback((f) => {
    if (!f) return;
    if (!hasAcceptedExtension(f.name)) {
      setRejected(true);
      return;
    }
    setRejected(false);
    setFile(f);
  }, []);

  return (
    <StageShell
      eyebrow="Stage 01, Signal Intake"
      title="Upload your resume."
      subtitle="Gemini reads it the way a mentor would: explicit skills, and the ones implied by what you actually did."
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`surface-glass flex w-full max-w-md cursor-pointer flex-col items-center gap-3 rounded-3xl border-dashed p-10 transition-colors ${
          dragOver ? "border-signal-cyan/60" : ""
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain"
          className="hidden"
          onChange={(e) => accept(e.target.files?.[0])}
        />
        {file ? (
          <>
            <FileText className="h-8 w-8 text-signal-cyan" strokeWidth={1.5} />
            <div className="font-mono-metric text-sm">{file.name}</div>
            <div className="text-xs text-ink-dim">{(file.size / 1024).toFixed(0)} KB · click to replace</div>
          </>
        ) : (
          <>
            <FileUp className="h-8 w-8 text-ink-dim" strokeWidth={1.5} />
            <div className="font-display text-md">Drop your resume here</div>
            <div className="text-xs text-ink-dim">or click to browse, PDF, DOCX, DOC, or TXT, up to 12MB</div>
          </>
        )}
      </div>

      {rejected && (
        <div className="mt-4 flex items-center gap-2 text-sm text-signal-rose">
          <AlertCircle className="h-4 w-4" /> That file type isn't supported. Try PDF, DOCX, DOC, or TXT.
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 text-sm text-signal-rose">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <motion.button
        whileHover={{ scale: file ? 1.03 : 1 }}
        whileTap={{ scale: file ? 0.97 : 1 }}
        disabled={!file}
        onClick={() => onSubmit(file)}
        className="edge-glow mt-8 rounded-full px-8 py-3.5 font-mono-metric text-sm uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-30"
        style={{
          background: file ? "linear-gradient(135deg, var(--violet), var(--cyan))" : "var(--carbon-raised)",
          color: file ? "#080a10" : "var(--ink-dim)",
          "--glow-color": "rgba(95,212,214,0.3)",
        }}
      >
        Run the analysis
      </motion.button>
    </StageShell>
  );
}
