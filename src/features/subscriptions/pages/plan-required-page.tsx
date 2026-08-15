import { LogOut, Lock } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BrandLogo, BrandWordmark } from "@/features/landing/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { SubscriptionStatusBadge } from "@/features/admin/components/subscription-status-badge";
import { useAuth } from "@/features/auth/context/use-auth";
import type { RanchSubscription } from "@/features/subscriptions/types";

const STATUS_COPY: Record<RanchSubscription["effectiveStatus"], string> = {
  active: "Tu estancia está en el plan Free.",
  trial: "Tu período de prueba todavía no incluye este panel.",
  expired: "El plan de tu estancia venció.",
  cancelled: "La suscripción de tu estancia fue cancelada.",
};

interface PlanRequiredPageProps {
  subscription: RanchSubscription | null;
}

export function PlanRequiredPage({ subscription }: PlanRequiredPageProps) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="flex h-18 items-center justify-between border-b border-brand-blue/10 bg-card px-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={28} />
          <BrandWordmark className="text-xl" />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" onClick={logout}>
            <LogOut data-icon="inline-start" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <Container className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center py-16">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Lock className="size-8 text-brand-blue" />
            </EmptyMedia>
            <EmptyTitle>Necesitás un plan pago para entrar acá</EmptyTitle>
            <EmptyDescription>
              {subscription ? STATUS_COPY[subscription.effectiveStatus] : "Tu estancia todavía no tiene una suscripción activa."} El panel
              web es para estancias con un plan pago (Estancia, Hacienda o Ganadero Plus). Contactá a Estancia360 para activar o renovar
              tu plan — mientras tanto podés seguir usando la app móvil normalmente.
            </EmptyDescription>
          </EmptyHeader>
          {subscription ? (
            <EmptyContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Plan actual: <span className="font-medium text-foreground">{subscription.plan.name}</span>
                <SubscriptionStatusBadge status={subscription.effectiveStatus} />
              </div>
            </EmptyContent>
          ) : null}
        </Empty>
      </Container>
    </div>
  );
}
