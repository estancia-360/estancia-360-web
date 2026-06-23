import type { ReactNode } from "react";
import { motion } from "motion/react";

type Direction = "up" | "left" | "right";

const OFFSET: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 24 },
  left: { x: 24 },
  right: { x: -24 },
};

interface AnimateInProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}

export function AnimateIn({
  children,
  direction = "up",
  delay = 0,
  className,
}: AnimateInProps) {
  const offset = OFFSET[direction];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -64px 0px" }}
      transition={{ duration: 0.6, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
