import { useEffect, useState, useCallback } from "react";
import { PlusCircle, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { RegisterBreedingServiceDialog } from "@/features/cria/components/register-breeding-service-dialog";
import { getBreedingServices } from "@/features/cria/api/cria-api";
import { SERVICE_TYPE_LABELS, type BreedingService } from "@/features/cria/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";

export function CriaPage() {
  const { session } = useAuth();
  const { ranch } = useRanchSubscription();
  const ranchId = ranch.id;
  const [services, setServices] = useState<BreedingService[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const load = useCallback(() => {
    if (!session) return;
    getBreedingServices(ranchId, page, session.accessToken)
      .then((res) => {
        setServices(res.data);
        setMeta(res.meta);
      })
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los servicios de monta.")))
      .finally(() => setIsLoading(false));
  }, [session, ranchId, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = () => {
    setIsLoading(true);
    load();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-blue">Cría</h1>
          <p className="text-sm text-muted-foreground">Servicios de monta registrados en la estancia.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw data-icon="inline-start" />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <PlusCircle data-icon="inline-start" />
            Nuevo servicio
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Servicios de monta</CardTitle>
          <CardDescription>
            {meta.total} {meta.total === 1 ? "servicio" : "servicios"}
          </CardDescription>
          <CardAction />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : services.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No hay servicios registrados todavía</EmptyTitle>
                <EmptyDescription>Registrá el primero con el botón de arriba.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hembra</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Lote reproductivo</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.event.animal.code}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{SERVICE_TYPE_LABELS[service.serviceType]}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{service.technician ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{service.reproductiveLot ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(service.event.eventDate).toLocaleDateString("es-BO", { timeZone: "UTC" })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {meta.pages > 1 ? (
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Página {meta.page} de {meta.pages}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      <ChevronLeft data-icon="inline-start" />
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)}>
                      Siguiente
                      <ChevronRight data-icon="inline-end" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <RegisterBreedingServiceDialog idRanch={ranchId} open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreated={load} />
    </div>
  );
}
