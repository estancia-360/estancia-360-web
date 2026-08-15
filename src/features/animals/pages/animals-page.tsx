import { useEffect, useState, useCallback } from "react";
import { PlusCircle, RefreshCcw, Beef, Venus, Mars } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { FadeIn } from "@/components/layout/fade-in";
import { StatTile } from "@/components/layout/stat-tile";
import { ModuleIcon } from "@/components/layout/module-icon";
import { PaginationControls } from "@/components/layout/pagination-controls";
import { CreateAnimalDialog } from "@/features/animals/components/create-animal-dialog";
import { getRanchAnimals } from "@/features/animals/api/animals-api";
import { PRODUCTIVE_STATUS_LABELS, type RanchAnimal } from "@/features/animals/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";

const STAGE_STYLE: Record<number, string> = {
  1: "bg-brand-orange/15 text-brand-orange-dark", // Cría
  2: "bg-brand-blue/10 text-brand-blue", // Recría
  3: "bg-brand-green/10 text-brand-green", // Engorde
  4: "bg-muted text-muted-foreground", // Baja
};

const ROW_CLASS = "border-b transition-colors hover:bg-muted/50";

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
      <FadeIn className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ModuleIcon icon={Beef} color="green" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-blue">Animales</h1>
            <p className="text-sm text-muted-foreground">Animales registrados en la estancia.</p>
          </div>
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
      </FadeIn>

      {!isLoading ? (
        <StatTile icon={Beef} color="green" label="Animales en la estancia" value={meta.total} className="max-w-xs" />
      ) : null}

      <FadeIn delay={100}>
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
                  <EmptyMedia variant="icon" className="size-12 rounded-full bg-brand-green/10 text-brand-green">
                    <Beef className="size-6" />
                  </EmptyMedia>
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
                    {animals.map((animal, index) => (
                      <motion.tr
                        key={animal.id}
                        className={ROW_CLASS}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                      >
                        <TableCell className="font-medium">{animal.code}</TableCell>
                        <TableCell className="text-muted-foreground">{animal.breed.name}</TableCell>
                        <TableCell className="text-muted-foreground">{animal.animalClass.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1">
                            {animal.sex === "F" ? (
                              <Venus className="size-3.5 text-brand-orange-dark" />
                            ) : (
                              <Mars className="size-3.5 text-brand-blue" />
                            )}
                            {animal.sex === "F" ? "Hembra" : "Macho"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={animal.idProductiveStatus ? STAGE_STYLE[animal.idProductiveStatus] : "bg-muted text-muted-foreground"}>
                            {animal.idProductiveStatus ? PRODUCTIVE_STATUS_LABELS[animal.idProductiveStatus] : "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={animal.status.id === 1 ? "default" : "secondary"}>{animal.status.name}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{animal.weight ? `${animal.weight} kg` : "—"}</TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>

                <PaginationControls page={meta.page} pages={meta.pages} onPageChange={setPage} />
              </>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      <CreateAnimalDialog idRanch={ranchId} open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreated={load} />
    </div>
  );
}
