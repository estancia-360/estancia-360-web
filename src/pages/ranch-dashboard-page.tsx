import { LogOut } from "lucide-react";
import { Container } from "@/components/layout/container";
import { BrandLogo, BrandWordmark } from "@/features/landing/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useAuth } from "@/features/auth/context/use-auth";

export function RanchDashboardPage() {
  const { session, logout } = useAuth();

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="flex h-18 items-center justify-between border-b border-brand-blue/10 bg-white px-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={28} />
          <BrandWordmark className="text-xl" />
        </div>
        <Button variant="ghost" onClick={logout}>
          <LogOut data-icon="inline-start" />
          Cerrar sesión
        </Button>
      </header>

      <Container className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center py-16">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BrandLogo size={40} />
            </EmptyMedia>
            <EmptyTitle>El panel de tu estancia está en construcción</EmptyTitle>
            <EmptyDescription>
              {session?.idRanch
                ? "Muy pronto vas a poder ver y gestionar tu estancia desde acá. Por ahora, usá la app móvil para tus operaciones diarias."
                : "Tu usuario todavía no está asociado a ninguna estancia. Contactá a Estancia360 para vincular tu cuenta."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Container>
    </div>
  );
}
