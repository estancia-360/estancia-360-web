import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CtaVariant = "primary" | "ghost" | "outline" | "nav-primary" | "nav-outline";
type CtaSize = "sm" | "md" | "lg" | "xl";

const VARIANT_CLASSES: Record<CtaVariant, string> = {
  primary:
    "bg-brand-green text-white shadow-[0_8px_32px_rgba(51,108,56,0.28)] hover:bg-brand-green-light hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(51,108,56,0.36)]",
  ghost:
    "border border-white/30 bg-white/12 text-white backdrop-blur-md hover:bg-white/20 hover:-translate-y-0.5",
  outline:
    "border border-brand-blue/10 bg-transparent text-brand-blue hover:border-brand-green hover:text-brand-green",
  "nav-primary":
    "bg-brand-green text-white shadow-[0_4px_16px_rgba(51,108,56,0.3)] hover:bg-brand-green-light hover:-translate-y-px",
  "nav-outline":
    "border border-brand-blue/10 bg-transparent text-brand-blue hover:border-brand-green hover:text-brand-green",
};

const SIZE_CLASSES: Record<CtaSize, string> = {
  sm: "px-5 py-2 text-sm",
  md: "px-7 py-3 text-[0.95rem]",
  lg: "px-8 py-[15px] text-base",
  xl: "px-9 py-[18px] text-[1.05rem]",
};

interface CtaLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: CtaVariant;
  size?: CtaSize;
  fullWidth?: boolean;
  children: ReactNode;
}

export function CtaLink({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...props
}: CtaLinkProps) {
  return (
    <a
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-200",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
