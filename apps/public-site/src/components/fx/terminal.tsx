import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TerminalProps {
  /** Lines typed one after another. `prompt` lines are prefixed with `$`. */
  lines: { text: string; prompt?: boolean }[];
  className?: string;
  title?: string;
}

/**
 * Decorative "secure terminal" that types its lines out on mount. It is purely
 * presentational (`aria-hidden`), so screen readers are not spammed; the same
 * information is available in the surrounding copy.
 */
export function Terminal({ lines, className, title = "cyberwolf@360: ~" }: TerminalProps) {
  const reduce = useReducedMotion();
  const full = lines.map((l) => l.text);
  const [shown, setShown] = useState<string[]>(reduce ? full : []);
  const [current, setCurrent] = useState(reduce ? "" : lines[0]?.text ?? "");
  const [done, setDone] = useState(reduce);

  useEffect(() => {
    if (reduce) return;
    let line = 0;
    let char = 0;
    let cancelled = false;

    const step = () => {
      if (cancelled) return;
      const text = lines[line]?.text ?? "";
      char += 1;
      setCurrent(text.slice(0, char));
      if (char >= text.length) {
        setShown((prev) => [...prev, text]);
        line += 1;
        char = 0;
        if (line >= lines.length) {
          setDone(true);
          return;
        }
        window.setTimeout(step, 420);
      } else {
        window.setTimeout(step, 26);
      }
    };

    const start = window.setTimeout(step, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
    };
  }, [lines, reduce]);

  return (
    <div className={cn("glass overflow-hidden rounded-[14px] shadow-card", className)} aria-hidden="true">
      <div className="flex items-center gap-2 border-b border-border/80 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 font-mono text-[11px] text-muted">{title}</span>
      </div>
      <div className="space-y-1.5 p-4 font-mono text-[13px] leading-relaxed">
        {shown.map((text, i) => (
          <p key={i} className="text-mint">
            {lines[i]?.prompt && <span className="text-neon">$ </span>}
            {text}
          </p>
        ))}
        {!done && (
          <p className="text-mint">
            {lines[shown.length]?.prompt && <span className="text-neon">$ </span>}
            {current}
            <span className="ml-0.5 inline-block h-3.5 w-[7px] translate-y-0.5 animate-blink bg-neon" />
          </p>
        )}
        {done && (
          <p className="text-mint">
            <span className="text-neon">$ </span>
            <span className="ml-0.5 inline-block h-3.5 w-[7px] translate-y-0.5 animate-blink bg-neon" />
          </p>
        )}
      </div>
    </div>
  );
}
