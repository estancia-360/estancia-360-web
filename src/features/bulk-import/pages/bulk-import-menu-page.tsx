import { NavLink } from "react-router";
import { Beef, Scale, Baby, HeartPulse, ArrowLeftRight, ChevronRight, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { hasProductionType, PRODUCTION_TYPE_IDS } from "@/features/subscriptions/types";

interface MenuItem {
  to: string;
  title: string;
  description: string;
  icon: typeof Beef;
  requiresProductionType?: number;
}

// Animales, Sanidad y Movimientos no son rubros — siempre disponibles. Pesajes aplica en
// Cría/Recría/Engorde por igual (decisión #10 del CLAUDE.md) así que tampoco se gatea acá.
// Gestación/Tactos es el único módulo de carga masiva atado a un rubro específico (Cría).
const ITEMS: MenuItem[] = [
  { to: "animales", title: "Animales", description: "Alta de inventario inicial o incorporación masiva.", icon: Beef },
  { to: "pesajes", title: "Pesajes", description: "Historial de pesos y condición corporal.", icon: Scale },
  {
    to: "gestacion",
    title: "Diagnóstico de gestación / Tactos",
    description: "Resultados de tacto de preñez.",
    icon: Baby,
    requiresProductionType: PRODUCTION_TYPE_IDS.CRIA,
  },
  { to: "sanidad", title: "Sanidad", description: "Vacunas, tratamientos e incidentes sanitarios.", icon: HeartPulse },
  { to: "movimientos", title: "Movimientos", description: "Compras, ventas, traslados, salidas y bajas.", icon: ArrowLeftRight },
];

export function BulkImportMenuPage() {
  const { ranch } = useRanchSubscription();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brand-blue">Cargas masivas</h1>
        <p className="text-sm text-muted-foreground">Descargá la plantilla de cada módulo, completala y subila para registrar en lote.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ITEMS.map((item) => {
          const enabled = item.requiresProductionType === undefined || hasProductionType(ranch, item.requiresProductionType);
          const content = (
            <Card className={enabled ? "transition-colors hover:border-brand-blue/40" : "opacity-60"}>
              <CardHeader className="flex-row items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                  {enabled ? <item.icon className="size-5" /> : <Lock className="size-5" />}
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {item.title}
                    {!enabled ? <Badge variant="outline">Rubro no habilitado</Badge> : null}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
                {enabled ? <ChevronRight className="size-4 text-muted-foreground" /> : null}
              </CardHeader>
            </Card>
          );

          return enabled ? (
            <NavLink key={item.to} to={item.to}>
              {content}
            </NavLink>
          ) : (
            <div key={item.to}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
