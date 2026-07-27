import { apiFetch } from "@/lib/api-client";
import type { RanchSubscription } from "@/features/subscriptions/types";

export function getMyRanchSubscription(idRanch: number, accessToken: string): Promise<{ subscription: RanchSubscription }> {
  return apiFetch(`/subscriptions/my-ranch/${idRanch}`, { accessToken });
}
