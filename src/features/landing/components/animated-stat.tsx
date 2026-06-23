import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

interface AnimatedStatProps {
  value: string;
  label: string;
}

function parseValue(raw: string) {
  const suffix = raw.replace(/[\d.]/g, "");
  const target = parseFloat(raw.replace(/[^\d.]/g, ""));
  return { target, suffix };
}

export function AnimatedStat({ value, label }: AnimatedStatProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(value.replace(/[\d.]/g, (digit) => (digit === "." ? "." : "0")));

  useEffect(() => {
    const { target, suffix } = parseValue(value);
    if (!isInView || Number.isNaN(target)) return;

    const duration = 1600;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const current = Math.round(eased * target * 10) / 10;
      setDisplay(`${current}${suffix}`);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [isInView, value]);

  return (
    <div className="px-7 text-center">
      <span ref={ref} className="block font-heading text-[1.8rem] font-extrabold tracking-tight text-white">
        {display}
      </span>
      <span className="mt-0.5 block text-xs text-white/60">{label}</span>
    </div>
  );
}
