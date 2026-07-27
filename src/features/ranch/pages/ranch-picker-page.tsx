import { useNavigate } from "react-router";
import { LogOut, Building2, ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { BrandLogo, BrandWordmark } from "@/features/landing/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/context/use-auth";
import { writeSelectedRanchId } from "@/features/ranch/lib/selected-ranch-storage";
import { NoRanchPage } from "@/features/ranch/pages/no-ranch-page";

export function RanchPickerPage() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const ranches = session?.ranches ?? [];

  if (ranches.length === 0) {
    return <NoRanchPage />;
  }

  const handleSelect = (idRanch: number) => {
    writeSelectedRanchId(idRanch);
    navigate("/dashboard", { replace: true });
  };

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

      <Container className="flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center gap-8 py-16">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-brand-blue">Elegí una estancia</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sos dueño de {ranches.length} {ranches.length === 1 ? "estancia" : "estancias"}. Entrá a la que querés gestionar.
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col gap-3">
          {ranches.map((ranch) => (
            <Card key={ranch.id} className="cursor-pointer transition-colors hover:border-brand-green" onClick={() => handleSelect(ranch.id)}>
              <CardContent className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                    <Building2 className="size-5" />
                  </div>
                  <span className="font-medium text-brand-blue">{ranch.name}</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </div>
  );
}
