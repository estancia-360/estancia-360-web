import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export function BrandLogo({ size = 32, className }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="15" fill="#336c38" />
      <path
        d="M8 22 C8 22 10 14 16 12 C22 10 24 22 24 22"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M11 18 C11 18 13 10 16 10 C19 10 21 18 21 18"
        stroke="#7aa641"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="16" cy="9" r="2.5" fill="white" />
    </svg>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-heading text-2xl font-extrabold tracking-tight text-brand-blue", className)}>
      Estancia<span className="text-brand-green">360</span>
    </span>
  );
}
