import { NavLink, Outlet, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Beef,
  Baby,
  Sprout,
  UtensilsCrossed,
  Stethoscope,
  ArrowLeftRight,
  LogOut,
  User,
  Users,
  Repeat,
  Fence,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/features/landing/components/brand-logo";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { hasProductionType, PRODUCTION_TYPE_IDS } from "@/features/subscriptions/types";
import { clearSelectedRanchId } from "@/features/ranch/lib/selected-ranch-storage";

// Cada módulo mobile online tiene su lugar reservado acá desde ya — todavía
// apuntan a la misma página "en construcción" hasta que se implementen uno
// por uno (mismo orden que el roadmap: Cría, Recría, Engorde, Sanidad,
// Movimientos). Cría/Recría/Engorde son rubros — solo aparecen si la estancia
// los tiene contratados (RN-09: nunca Engorde sin Recría, ni Recría sin Cría).
// Animales, Sanidad y Movimientos no son rubros, siempre aplican.
interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end: boolean;
  activeClassName?: string;
  requiresProductionType?: number;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "General",
    items: [{ to: "/dashboard", label: "Resumen", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Estancia",
    items: [
      { to: "/dashboard/equipo", label: "Equipo", icon: Users, end: false, activeClassName: "bg-brand-blue/10 text-brand-blue" },
      {
        to: "/dashboard/potreros",
        label: "Potreros y Lotes",
        icon: Fence,
        end: false,
        activeClassName: "bg-brand-accent/15 text-brand-green-dark",
      },
    ],
  },
  {
    label: "Producción",
    items: [
      { to: "/dashboard/animales", label: "Animales", icon: Beef, end: false, activeClassName: "bg-brand-green/10 text-brand-green" },
      {
        to: "/dashboard/cria",
        label: "Cría",
        icon: Baby,
        end: false,
        activeClassName: "bg-brand-orange/15 text-brand-orange-dark",
        requiresProductionType: PRODUCTION_TYPE_IDS.CRIA,
      },
      {
        to: "/dashboard/recria",
        label: "Recría",
        icon: Sprout,
        end: false,
        activeClassName: "bg-brand-blue/10 text-brand-blue",
        requiresProductionType: PRODUCTION_TYPE_IDS.RECRIA,
      },
      {
        to: "/dashboard/engorde",
        label: "Engorde",
        icon: UtensilsCrossed,
        end: false,
        activeClassName: "bg-brand-green/10 text-brand-green",
        requiresProductionType: PRODUCTION_TYPE_IDS.ENGORDE,
      },
      {
        to: "/dashboard/sanidad",
        label: "Sanidad",
        icon: Stethoscope,
        end: false,
        activeClassName: "bg-brand-blue/10 text-brand-blue",
      },
      {
        to: "/dashboard/movimientos",
        label: "Movimientos",
        icon: ArrowLeftRight,
        end: false,
        activeClassName: "bg-brand-orange/15 text-brand-orange-dark",
      },
      {
        to: "/dashboard/cargas-masivas",
        label: "Cargas Masivas",
        icon: UploadCloud,
        end: false,
        activeClassName: "bg-brand-blue/10 text-brand-blue",
      },
    ],
  },
];

export function RanchLayout() {
  const { session, logout } = useAuth();
  const subscription = useRanchSubscription();
  const navigate = useNavigate();
  const initials = `U${session?.idUser}`.slice(0, 2).toUpperCase();
  const hasMultipleRanches = (session?.ranches.length ?? 0) > 1;

  const handleSwitchRanch = () => {
    clearSelectedRanchId();
    navigate("/ranches");
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <BrandLogo size={24} />
            <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate font-heading text-sm font-bold text-brand-blue">{subscription.ranch.name}</span>
              <span className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                {subscription.plan.name}
                <Badge variant="outline" className="h-4 px-1.5 text-[0.6rem]">
                  {subscription.effectiveStatus === "trial" ? "Prueba" : "Activo"}
                </Badge>
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {navGroups.map((group) => {
            const items = group.items.filter(
              (item) => item.requiresProductionType === undefined || hasProductionType(subscription.ranch, item.requiresProductionType),
            );
            if (items.length === 0) return null;
            return (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton
                          tooltip={item.label}
                          render={
                            <NavLink
                              to={item.to}
                              end={item.end}
                              className={({ isActive }) =>
                                cn(isActive && (item.activeClassName ?? "bg-sidebar-accent text-sidebar-accent-foreground"))
                              }
                            />
                          }
                        >
                          <item.icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarContent>

        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton size="lg">
                  <Avatar className="size-6 rounded-md">
                    <AvatarFallback className="rounded-md bg-brand-green text-[0.65rem] text-white">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">Usuario #{session?.idUser}</span>
                </SidebarMenuButton>
              }
            />
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <User className="size-3.5" />
                  {subscription.ranch.name}
                </DropdownMenuLabel>
                {hasMultipleRanches ? (
                  <DropdownMenuItem onClick={handleSwitchRanch}>
                    <Repeat />
                    Cambiar de estancia
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} variant="destructive">
                  <LogOut />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
        </header>
        <div className="flex flex-1 flex-col gap-6 bg-brand-cream/40 p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
