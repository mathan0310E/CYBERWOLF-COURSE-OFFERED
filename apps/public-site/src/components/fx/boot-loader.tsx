import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const BOOT_LINES = [
  "initialising cyberwolf 360",
  "loading course catalogue",
  "verifying secure channel",
  "ready",
];

/**
 * One-time boot sequence shown on first paint. It is decorative and fully
 * skipped under `prefers-reduced-motion`. It never blocks the page for long
 * (~1.4s) and unmounts itself, so it cannot trap focus or inputs.
 */
export function BootLoader() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(!reduce);
  const [progress, setProgress] = useState(reduce ? 100 : 0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) return;

    document.documentElement.classList.add("no-scroll");

    const started = performance.now();
    const total = 1400;
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min((now - started) / total, 1);
      const eased = 1 - Math.pow(1 - p, 2);
      setProgress(Math.round(eased * 100));
      setStep(Math.min(BOOT_LINES.length - 1, Math.floor(eased * BOOT_LINES.length)));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        window.setTimeout(() => setVisible(false), 220);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("no-scroll");
    };
  }, [reduce]);

  useEffect(() => {
    if (!visible) document.documentElement.classList.remove("no-scroll");
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          role="status"
          aria-label="Loading CyberWolf 360"
        >
          <div className="grid-bg absolute inset-0 opacity-[0.35]" aria-hidden="true" />
          <div className="aurora left-[10%] top-[15%] h-72 w-72 bg-neon/25" aria-hidden="true" />
          <div
            className="aurora bottom-[10%] right-[8%] h-80 w-80 bg-emerald/25"
            style={{ animationDelay: "1.2s" }}
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-center px-6">
            <div className="relative h-20 w-20">
              <span className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-neon/40" />
              <span className="absolute inset-2 animate-pulse-ring rounded-full border border-neon/60" />
              <img
                src="/cyberwolf-logo.png"
                alt=""
                width={56}
                height={56}
                className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 object-contain"
              />
            </div>

            <p className="font-display mt-6 text-lg font-semibold tracking-tight">
              CyberWolf<span className="text-neon">360</span>
            </p>

            <div className="mt-6 h-1 w-56 overflow-hidden rounded-pill bg-white/10">
              <div
                className="h-full rounded-pill bg-gradient-to-r from-neon to-emerald transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              {BOOT_LINES[step]}… {progress}%
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
