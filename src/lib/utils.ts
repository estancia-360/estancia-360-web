import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 12f (auditoria QA E2E, 2026-09-03): iniciales reales a partir del nombre, en vez de "U" + idUser.
export function getInitials(fullname: string): string {
  const words = fullname.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  const initials = words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0]
  return initials.toUpperCase()
}
