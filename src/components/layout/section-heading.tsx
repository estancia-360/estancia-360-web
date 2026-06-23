import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  label: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  variant?: "default" | "light";
  className?: string;
}

export function SectionHeading({
  label,
  title,
  description,
  align = "left",
  variant = "default",
  className,
}: SectionHeadingProps) {
  const isLight = variant === "light";

  return (
    <div
      className={cn(
        "mb-10 max-w-xl sm:mb-14",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <span
        className={cn(
          "mb-4 inline-block rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase",
          isLight
            ? "border-white/20 bg-white/12 text-white/90"
            : "border-brand-green/15 bg-brand-green/8 text-brand-green",
        )}
      >
        {label}
      </span>
      <h2
        className={cn(
          "font-heading text-[clamp(1.9rem,3.5vw,2.8rem)] leading-[1.15] font-extrabold tracking-tight",
          isLight ? "text-white" : "text-brand-blue",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 text-[clamp(1rem,1.5vw,1.1rem)] leading-relaxed",
            isLight ? "text-white/80" : "text-brand-text-muted",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
