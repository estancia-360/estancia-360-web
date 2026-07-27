import { useEffect, useState, useCallback } from "react";
import { PlusCircle, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { CreateAnimalDialog } from "@/features/animals/components/create-animal-dialog";
import { getRanchAnimals } from "@/features/animals/api/animals-api";
import { PRODUCTIVE_STATUS_LABELS, type RanchAnimal } from "@/features/animals/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";

export function AnimalsPage() {
  const { session } = useAuth();
  const { ranch } = useRanchSubscription();
  const ranchId = ranch.id;
  const [animals, setAnimals] = useState<RanchAnimal[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const load = useCallback(() => {
    if (!session) return;
    getRanchAnimals(ranchId, page, session.accessToken)
      .then((res) => {
        setAnimals(res.data);
        setMeta(res.meta);
      })
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los animales.")))
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
          <h1 className="font-heading text-2xl font-bold text-brand-blue">Animales</h1>
          <p className="text-sm text-muted-foreground">Animales registrados en la estancia.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw data-icon="inline-start" />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <PlusCircle data-icon="inline-start" />
            Nuevo animal
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los animales</CardTitle>
          <CardDescription>
            {meta.total} {meta.total === 1 ? "animal" : "animales"}
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
          ) : animals.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No hay animales todavía</EmptyTitle>
                <EmptyDescription>Registrá el primero con el botón de arriba.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Raza</TableHead>
                    <TableHead>Clase</TableHead>
                    <TableHead>Sexo</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Peso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {animals.map((animal) => (
                    <TableRow key={animal.id}>
                      <TableCell className="font-medium">{animal.code}</TableCell>
                      <TableCell className="text-muted-foreground">{animal.breed.name}</TableCell>
                      <TableCell className="text-muted-foreground">{animal.animalClass.name}</TableCell>
                      <TableCell>{animal.sex === "F" ? "Hembra" : "Macho"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {animal.idProductiveStatus ? PRODUCTIVE_STATUS_LABELS[animal.idProductiveStatus] : "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={animal.status.id === 1 ? "default" : "secondary"}>{animal.status.name}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{animal.weight ? `${animal.weight} kg` : "—"}</TableCell>
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

      <CreateAnimalDialog idRanch={ranchId} open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreated={load} />
    </div>
  );
}
