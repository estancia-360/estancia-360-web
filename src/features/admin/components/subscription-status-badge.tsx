import { Badge } from "@/components/ui/badge";
import type { SubscriptionEffectiveStatus } from "@/features/admin/types/subscriptions";

const STATUS_CONFIG: Record<SubscriptionEffectiveStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  trial: { label: "Prueba", variant: "outline" },
  active: { label: "Activa", variant: "default" },
  expired: { label: "Vencida", variant: "destructive" },
  cancelled: { label: "Cancelada", variant: "secondary" },
};

export function SubscriptionStatusBadge({ status }: { status: SubscriptionEffectiveStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
