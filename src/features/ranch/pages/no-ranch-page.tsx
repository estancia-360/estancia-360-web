import { LogOut } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BrandLogo, BrandWordmark } from "@/features/landing/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useAuth } from "@/features/auth/context/use-auth";

export function NoRanchPage() {
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
              <BrandLogo size={40} />
            </EmptyMedia>
            <EmptyTitle>Tu usuario no tiene acceso a ninguna estancia</EmptyTitle>
            <EmptyDescription>
              El panel web es para el dueño de una estancia o los administradores que agregó. Si trabajás en una estancia, pedile al
              dueño que te agregue como administrador desde su panel.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Container>
    </div>
  );
}
