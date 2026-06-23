import { HeartPulse, TrendingUp, BarChart3, Navigation, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Solution {
  icon: LucideIcon;
  title: string;
  description: string;
  tags: string[];
  emphasis?: "primary" | "accent";
}

export const solutions: Solution[] = [
  {
    icon: HeartPulse,
    title: "Cría",
    description:
      "Gestión completa de registros reproductivos, pariciones, destetes y seguimiento de crías desde el nacimiento.",
    tags: ["Pariciones", "Destete", "Genealogía"],
    emphasis: "primary",
  },
  {
    icon: TrendingUp,
    title: "Recría",
    description:
      "Control detallado del desarrollo de animales jóvenes, con seguimiento de pesos, ganancias y evolución.",
    tags: ["Pesos", "Ganancia diaria", "Evaluación"],
  },
  {
    icon: BarChart3,
    title: "Engorde",
    description:
      "Seguimiento productivo de animales en fase de engorde con métricas de conversión y rendimiento.",
    tags: ["Conversión", "Lotes", "Rendimiento"],
  },
  {
    icon: Navigation,
    title: "Movimientos",
    description:
      "Registro y trazabilidad completa de todos los movimientos entre potreros, estancias y propietarios.",
    tags: ["Traslados", "Trazabilidad", "Potreros"],
  },
  {
    icon: Activity,
    title: "Sanidad",
    description:
      "Control completo de tratamientos veterinarios, vacunaciones, eventos sanitarios y protocolos de salud animal.",
    tags: ["Vacunas", "Tratamientos", "Alertas"],
    emphasis: "accent",
  },
];
