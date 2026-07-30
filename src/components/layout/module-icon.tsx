import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const COLOR_STYLES = {
  green: "bg-brand-green/10 text-brand-green",
  orange: "bg-brand-orange/10 text-brand-orange-dark",
  blue: "bg-brand-blue/10 text-brand-blue",
  accent: "bg-brand-accent/15 text-brand-green-dark",
} as const;

type ModuleColor = keyof typeof COLOR_STYLES;

const SIZE_STYLES = {
  default: "size-11 [&_svg]:size-5",
  sm: "size-9 [&_svg]:size-4",
} as const;

interface ModuleIconProps {
  icon: LucideIcon;
  color: ModuleColor;
  size?: keyof typeof SIZE_STYLES;
  className?: string;
}

/** Insignia circular de color por módulo — misma identidad en header de página y título de diálogo. */
export function ModuleIcon({ icon: Icon, color, size = "default", className }: ModuleIconProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        COLOR_STYLES[color],
        SIZE_STYLES[size],
        className,
      )}
    >
      <Icon />
    </div>
  );
}
