import { useEffect, useState, useCallback } from "react";
import { RefreshCcw, Sprout, Scale, ArrowRightCircle, Venus, Mars } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { FadeIn } from "@/components/layout/fade-in";
import { StatTile } from "@/components/layout/stat-tile";
import { ModuleIcon } from "@/components/layout/module-icon";
import { WeightRecordDialog } from "@/features/rearing/components/weight-record-dialog";
import { RearingSelectionDialog } from "@/features/rearing/components/rearing-selection-dialog";
import { getRanchAnimals } from "@/features/animals/api/animals-api";
import { PRODUCTIVE_STATUS_IDS, type RanchAnimal } from "@/features/animals/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";

const ROW_CLASS = "border-b transition-colors hover:bg-muted/50";

export function RearingPage() {
  const { session } = useAuth();
  const { ranch } = useRanchSubscription();
  const ranchId = ranch.id;

  const [animals, setAnimals] = useState<RanchAnimal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [weightAnimal, setWeightAnimal] = useState<RanchAnimal | null>(null);
  const [selectionAnimal, setSelectionAnimal] = useState<RanchAnimal | null>(null);

  const load = useCallback(() => {
    if (!session) return;
    getRanchAnimals(ranchId, 1, session.accessToken, 200)
      .then((res) => setAnimals(res.data.filter((a) => a.idProductiveStatus === PRODUCTIVE_STATUS_IDS.RECRIA)))
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los animales.")))
      .finally(() => setIsLoading(false));
  }, [session, ranchId]);

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
          <ModuleIcon icon={Sprout} color="blue" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-blue">Recría</h1>
            <p className="text-sm text-muted-foreground">Pesajes y selección de destino de los animales en recría.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCcw data-icon="inline-start" />
          Actualizar
        </Button>
      </FadeIn>

      {!isLoading ? (
        <StatTile icon={Sprout} color="blue" label="Animales en recría" value={animals.length} className="max-w-xs" />
      ) : null}

      <FadeIn delay={100}>
        <Card>
          <CardHeader>
            <CardTitle>Animales en recría</CardTitle>
            <CardDescription>
              {animals.length} {animals.length === 1 ? "animal" : "animales"}
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
                  <EmptyMedia variant="icon" className="size-12 rounded-full bg-brand-blue/10 text-brand-blue">
                    <Sprout className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>No hay animales en recría</EmptyTitle>
                  <EmptyDescription>Los animales aparecen acá después del destete.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Raza</TableHead>
                    <TableHead>Sexo</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
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
                      <TableCell className="text-muted-foreground">{animal.weight ? `${animal.weight} kg` : "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setWeightAnimal(animal)}>
                            <Scale data-icon="inline-start" />
                            Pesaje
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setSelectionAnimal(animal)}>
                            <ArrowRightCircle data-icon="inline-start" />
                            Destino
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      <WeightRecordDialog
        idRanch={ranchId}
        animal={weightAnimal}
        open={!!weightAnimal}
        onOpenChange={(open) => {
          if (!open) setWeightAnimal(null);
        }}
        onCreated={load}
      />
      <RearingSelectionDialog
        idRanch={ranchId}
        animal={selectionAnimal}
        open={!!selectionAnimal}
        onOpenChange={(open) => {
          if (!open) setSelectionAnimal(null);
        }}
        onCreated={load}
      />
    </div>
  );
}
