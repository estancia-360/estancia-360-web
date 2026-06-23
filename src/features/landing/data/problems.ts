import { FileText, Search, LayoutGrid, Clock, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Problem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const problems: Problem[] = [
  {
    icon: FileText,
    title: "Registros dispersos",
    description:
      "Información en cuadernos, hojas de cálculo y papeles sueltos que nunca están cuando los necesitas.",
  },
  {
    icon: Search,
    title: "Información difícil de encontrar",
    description:
      "Perder tiempo buscando datos de un animal o un movimiento cuando más urgente lo necesitas.",
  },
  {
    icon: LayoutGrid,
    title: "Control manual de movimientos",
    description:
      "Seguimiento de traslados entre potreros y estancias sin un sistema claro ni trazabilidad.",
  },
  {
    icon: Clock,
    title: "Procesos administrativos lentos",
    description:
      "Tareas que deberían tomar minutos se convierten en horas por falta de herramientas adecuadas.",
  },
  {
    icon: TrendingUp,
    title: "Falta de información actualizada",
    description:
      "Tomar decisiones importantes sin datos actualizados es un riesgo que ningún productor puede permitirse.",
  },
];
