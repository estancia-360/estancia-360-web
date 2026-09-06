import { NavLink, Outlet } from "react-router";
import { LayoutDashboard, ReceiptText, Users, LogOut, User } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
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
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/features/auth/context/use-auth";

const navGroups = [
  {
    label: "Pagos",
    items: [
      { to: "/admin", label: "Métricas", icon: LayoutDashboard, end: true },
      { to: "/admin/subscriptions", label: "Suscripciones", icon: ReceiptText, end: false },
    ],
  },
  {
    label: "Administración",
    items: [{ to: "/admin/users", label: "Usuarios", icon: Users, end: false }],
  },
];

export function AdminLayout() {
  const { session, logout } = useAuth();
  const initials = session ? getInitials(session.fullname) : "AD";

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <BrandLogo size={24} />
            <span className="font-heading text-sm font-bold text-brand-blue group-data-[collapsible=icon]:hidden">
              Estancia<span className="text-brand-green">360</span> Admin
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        render={
                          <NavLink
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => cn(isActive && "bg-sidebar-accent text-sidebar-accent-foreground")}
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
          ))}
        </SidebarContent>

        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton size="lg">
                  <Avatar className="size-6 rounded-md">
                    <AvatarFallback className="rounded-md bg-brand-green text-[0.65rem] text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">{session?.fullname ?? "Admin"}</span>
                </SidebarMenuButton>
              }
            />
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <User className="size-3.5" />
                  Sesión de administrador
                </DropdownMenuLabel>
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
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
          <SidebarTrigger />
          <ThemeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-6 bg-brand-cream/40 p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
