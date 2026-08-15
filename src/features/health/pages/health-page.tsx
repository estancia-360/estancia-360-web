import { useEffect, useState, useCallback } from "react";
import { RefreshCcw, HeartPulse, Syringe, Pill, Stethoscope, Venus, Mars } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { FadeIn } from "@/components/layout/fade-in";
import { StatTile } from "@/components/layout/stat-tile";
import { ModuleIcon } from "@/components/layout/module-icon";
import { PaginationControls } from "@/components/layout/pagination-controls";
import { VaccinationDialog } from "@/features/health/components/vaccination-dialog";
import { TreatmentDialog } from "@/features/health/components/treatment-dialog";
import { HealthIncidentDialog } from "@/features/health/components/health-incident-dialog";
import { getRanchAnimals } from "@/features/animals/api/animals-api";
import { ANIMAL_STATUS_IDS, PRODUCTIVE_STATUS_IDS, type RanchAnimal } from "@/features/animals/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";

const ROW_CLASS = "border-b transition-colors hover:bg-muted/50";

export function HealthPage() {
  const { session } = useAuth();
  const { ranch } = useRanchSubscription();
  const ranchId = ranch.id;

  const [animals, setAnimals] = useState<RanchAnimal[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [inObservation, setInObservation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [vaccinationAnimal, setVaccinationAnimal] = useState<RanchAnimal | null>(null);
  const [treatmentAnimal, setTreatmentAnimal] = useState<RanchAnimal | null>(null);
  const [incidentAnimal, setIncidentAnimal] = useState<RanchAnimal | null>(null);

  const load = useCallback(() => {
    if (!session) return;
    Promise.all([
      getRanchAnimals(ranchId, page, session.accessToken, 20, { excludeProductiveStatus: PRODUCTIVE_STATUS_IDS.BAJA }),
      // Conteo liviano (limit=1, solo se usa meta.total) — el estado "en observación" no depende
      // de la etapa productiva, así que no se puede derivar de la página actual de animales.
      getRanchAnimals(ranchId, 1, session.accessToken, 1, { idStatus: ANIMAL_STATUS_IDS.OBSERVATION }),
    ])
      .then(([animalsRes, observationRes]) => {
        setAnimals(animalsRes.data);
        setMeta(animalsRes.meta);
        setInObservation(observationRes.meta.total);
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
          <ModuleIcon icon={HeartPulse} color="blue" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-blue">Sanidad</h1>
            <p className="text-sm text-muted-foreground">Vacunaciones, tratamientos e incidentes sanitarios.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCcw data-icon="inline-start" />
          Actualizar
        </Button>
      </FadeIn>

      {!isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile icon={HeartPulse} color="blue" label="Animales activos" value={meta.total} delay={0} />
          <StatTile icon={Stethoscope} color="orange" label="En observación" value={inObservation} delay={60} />
        </div>
      ) : null}

      <FadeIn delay={100}>
        <Card>
          <CardHeader>
            <CardTitle>Animales</CardTitle>
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
                  <EmptyMedia variant="icon" className="size-12 rounded-full bg-brand-blue/10 text-brand-blue">
                    <HeartPulse className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>No hay animales activos</EmptyTitle>
                  <EmptyDescription>Los animales aparecen acá mientras no estén dados de baja.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Raza</TableHead>
                    <TableHead>Sexo</TableHead>
                    <TableHead>Estado</TableHead>
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
                      <TableCell>
                        {animal.status.id === ANIMAL_STATUS_IDS.OBSERVATION ? (
                          <Badge variant="outline" className="border-brand-orange/40 text-brand-orange-dark">
                            En observación
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">{animal.status.name}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setVaccinationAnimal(animal)}>
                            <Syringe data-icon="inline-start" />
                            Vacuna
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setTreatmentAnimal(animal)}>
                            <Pill data-icon="inline-start" />
                            Tratamiento
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setIncidentAnimal(animal)}>
                            <Stethoscope data-icon="inline-start" />
                            Incidente
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
            <PaginationControls page={meta.page} pages={meta.pages} onPageChange={setPage} />
          </CardContent>
        </Card>
      </FadeIn>

      <VaccinationDialog
        animal={vaccinationAnimal}
        open={!!vaccinationAnimal}
        onOpenChange={(open) => {
          if (!open) setVaccinationAnimal(null);
        }}
        onCreated={load}
      />
      <TreatmentDialog
        animal={treatmentAnimal}
        open={!!treatmentAnimal}
        onOpenChange={(open) => {
          if (!open) setTreatmentAnimal(null);
        }}
        onCreated={load}
      />
      <HealthIncidentDialog
        animal={incidentAnimal}
        open={!!incidentAnimal}
        onOpenChange={(open) => {
          if (!open) setIncidentAnimal(null);
        }}
        onCreated={load}
      />
    </div>
  );
}
