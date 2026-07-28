import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const COLOR_STYLES = {
  green: "bg-brand-green/10 text-brand-green",
  orange: "bg-brand-orange/10 text-brand-orange-dark",
  blue: "bg-brand-blue/10 text-brand-blue",
  accent: "bg-brand-accent/15 text-brand-green-dark",
} as const;

type StatColor = keyof typeof COLOR_STYLES;

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: StatColor;
  delay?: number;
  className?: string;
}

function useCountUp(target: number, duration = 700): number {
  const [display, setDisplay] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const from = prevTarget.current;
    const start = performance.now();
    let frame: number;

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        prevTarget.current = target;
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}

/** Tile de estadística con ícono de color y conteo animado — usado en los headers de los módulos. */
export function StatTile({ icon: Icon, label, value, color, delay = 0, className }: StatTileProps) {
  const display = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10", className)}
    >
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", COLOR_STYLES[color])}>
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col">
        <span className="font-heading text-xl font-bold text-brand-blue">{display}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </motion.div>
  );
}
