import { Home, Users, ClipboardList, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TimelineStep {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: boolean;
}

export const timelineSteps: TimelineStep[] = [
  {
    icon: Home,
    title: "Registra tu estancia",
    description:
      "Crea tu perfil de productor y configura tu operación: nombre, departamento, ubicación y características de tu estancia.",
  },
  {
    icon: Users,
    title: "Carga tus animales",
    description:
      "Importa o ingresa tu rodeo existente. Agrega caravanas, razas, edades y datos iniciales de cada animal con facilidad.",
  },
  {
    icon: ClipboardList,
    title: "Gestiona operaciones",
    description:
      "Registra movimientos, eventos sanitarios, pariciones, pesos y todo lo que ocurre en tu estancia día a día.",
  },
  {
    icon: BarChart3,
    title: "Obtén información para decidir",
    description:
      "Accede a reportes, estadísticas e indicadores clave que te ayudan a tomar mejores decisiones para tu operación ganadera.",
    accent: true,
  },
];
