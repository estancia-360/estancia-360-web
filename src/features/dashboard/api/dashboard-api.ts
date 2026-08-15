import { apiFetch } from "@/lib/api-client";
import type { DashboardStats } from "@/features/dashboard/types";

export function getDashboardStats(idRanch: number, accessToken: string): Promise<{ dashboard: DashboardStats }> {
  return apiFetch(`/dashboard/${idRanch}`, { accessToken });
}
