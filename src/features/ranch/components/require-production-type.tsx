import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { hasProductionType } from "@/features/subscriptions/types";

interface RequireProductionTypeProps {
  idProductionType: number;
  moduleName: string;
  children: ReactNode;
}

/**
 * Gatea una ruta de módulo por rubro habilitado — evita que alguien entre por
 * URL directa a Recría/Engorde si la estancia no los tiene contratados (RN-09:
 * nunca Engorde sin Recría, ni Recría sin Cría). El sidebar ya oculta el link,
 * esto es la segunda capa por si la URL se comparte o se escribe a mano.
 */
export function RequireProductionType({ idProductionType, moduleName, children }: RequireProductionTypeProps) {
  const { ranch } = useRanchSubscription();

  if (!hasProductionType(ranch, idProductionType)) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-12 rounded-full bg-brand-blue/10 text-brand-blue">
              <Lock className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{moduleName} no está habilitado</EmptyTitle>
            <EmptyDescription>
              Tu estancia no tiene el rubro {moduleName} contratado. Contactá a Estancia360 si querés sumarlo a tu plan.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return <>{children}</>;
}
