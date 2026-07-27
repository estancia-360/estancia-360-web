const STORAGE_KEY = "estancia360.selectedRanch";

export function readSelectedRanchId(): number | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isInteger(parsed) ? parsed : null;
}

export function writeSelectedRanchId(idRanch: number): void {
  localStorage.setItem(STORAGE_KEY, String(idRanch));
}

export function clearSelectedRanchId(): void {
  localStorage.removeItem(STORAGE_KEY);
}
