import { useEffect, useState, useCallback } from "react";
import { PlusCircle, RefreshCcw, UtensilsCrossed, Scale, Wheat, Venus, Mars } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FadeIn } from "@/components/layout/fade-in";
import { StatTile } from "@/components/layout/stat-tile";
import { ModuleIcon } from "@/components/layout/module-icon";
import { PaginationControls } from "@/components/layout/pagination-controls";
import { WeightRecordDialog } from "@/features/rearing/components/weight-record-dialog";
import { FatteningEntryDialog } from "@/features/fattening/components/fattening-entry-dialog";
import { FeedRecordDialog } from "@/features/fattening/components/feed-record-dialog";
import { getRanchAnimals, getRanchLots } from "@/features/animals/api/animals-api";
import { PRODUCTIVE_STATUS_IDS, type RanchAnimal, type RanchLot } from "@/features/animals/types";
import { getFeedRecords } from "@/features/fattening/api/fattening-api";
import type { FeedRecord } from "@/features/fattening/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";

const ROW_CLASS = "border-b transition-colors hover:bg-muted/50";
const EMPTY_META = { page: 1, limit: 20, total: 0, pages: 1 };

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("es-BO", { timeZone: "UTC" });
}

export function FatteningPage() {
  const { session } = useAuth();
  const { ranch } = useRanchSubscription();
  const ranchId = ranch.id;

  const [animals, setAnimals] = useState<RanchAnimal[]>([]);
  const [animalsPage, setAnimalsPage] = useState(1);
  const [animalsMeta, setAnimalsMeta] = useState(EMPTY_META);
  const [fatteningLots, setFatteningLots] = useState<RanchLot[]>([]);
  const [feedByLot, setFeedByLot] = useState<Record<number, { records: FeedRecord[]; meta: typeof EMPTY_META }>>({});
  const [feedPageByLot, setFeedPageByLot] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [weightAnimal, setWeightAnimal] = useState<RanchAnimal | null>(null);
  const [feedLot, setFeedLot] = useState<RanchLot | null>(null);

  const load = useCallback(() => {
    if (!session) return;
    Promise.all([
      getRanchAnimals(ranchId, animalsPage, session.accessToken, 20, { idProductiveStatus: PRODUCTIVE_STATUS_IDS.ENGORDE }),
      getRanchLots(ranchId, session.accessToken),
    ])
      .then(async ([animalsRes, lots]) => {
        setAnimals(animalsRes.data);
        setAnimalsMeta(animalsRes.meta);
        const engordeLots = lots.filter((l) => l.lotType === "engorde");
        setFatteningLots(engordeLots);

        const feedResults = await Promise.all(
          engordeLots.map((lot) =>
            getFeedRecords(lot.id, feedPageByLot[lot.id] ?? 1, session.accessToken).then(
              (res) => [lot.id, { records: res.data, meta: res.meta }] as const,
            ),
          ),
        );
        setFeedByLot(Object.fromEntries(feedResults));
      })
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los datos de engorde.")))
      .finally(() => setIsLoading(false));
  }, [session, ranchId, animalsPage, feedPageByLot]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = () => {
    setIsLoading(true);
    load();
  };

  const totalFeedRecords = Object.values(feedByLot).reduce((sum, entry) => sum + entry.meta.total, 0);

  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ModuleIcon icon={UtensilsCrossed} color="green" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-blue">Engorde</h1>
            <p className="text-sm text-muted-foreground">Animales en terminación y su alimentación.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw data-icon="inline-start" />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => setIsEntryOpen(true)}>
            <PlusCircle data-icon="inline-start" />
            Nuevo ingreso
          </Button>
        </div>
      </FadeIn>

      {!isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile icon={UtensilsCrossed} color="green" label="Animales en engorde" value={animalsMeta.total} delay={0} />
          <StatTile icon={Wheat} color="orange" label="Lotes de engorde" value={fatteningLots.length} delay={60} />
          <StatTile icon={Scale} color="blue" label="Registros de alimentación" value={totalFeedRecords} delay={120} />
        </div>
      ) : null}

      <FadeIn delay={100}>
        <Card>
          <CardContent>
            <Tabs defaultValue="animals">
              <TabsList>
                <TabsTrigger value="animals">Animales</TabsTrigger>
                <TabsTrigger value="feeding">Alimentación</TabsTrigger>
              </TabsList>

              <TabsContent value="animals" className="pt-4">
                <CardTitle className="mb-3">Animales en engorde</CardTitle>
                {isLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : animals.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="size-12 rounded-full bg-brand-green/10 text-brand-green">
                        <UtensilsCrossed className="size-6" />
                      </EmptyMedia>
                      <EmptyTitle>No hay animales en engorde</EmptyTitle>
                      <EmptyDescription>Registrá un ingreso con el botón de arriba, o desde Recría.</EmptyDescription>
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
                            <Button variant="outline" size="sm" onClick={() => setWeightAnimal(animal)}>
                              <Scale data-icon="inline-start" />
                              Pesaje
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <PaginationControls page={animalsMeta.page} pages={animalsMeta.pages} onPageChange={setAnimalsPage} />
              </TabsContent>

              <TabsContent value="feeding" className="pt-4">
                <CardTitle className="mb-3">Alimentación por lote</CardTitle>
                {isLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : fatteningLots.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="size-12 rounded-full bg-brand-orange/15 text-brand-orange-dark">
                        <Wheat className="size-6" />
                      </EmptyMedia>
                      <EmptyTitle>No hay lotes de engorde todavía</EmptyTitle>
                      <EmptyDescription>Creá uno en Potreros y Lotes para poder registrar alimentación.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <div className="flex flex-col gap-4">
                    {fatteningLots.map((lot) => {
                      const entry = feedByLot[lot.id];
                      const records = entry?.records ?? [];
                      const feedMeta = entry?.meta ?? EMPTY_META;
                      return (
                        <div key={lot.id} className="rounded-lg ring-1 ring-foreground/10">
                          <div className="flex items-center justify-between px-4 py-3">
                            <div>
                              <p className="font-medium">{lot.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {feedMeta.total} {feedMeta.total === 1 ? "registro" : "registros"}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setFeedLot(lot)}>
                              <PlusCircle data-icon="inline-start" />
                              Registrar alimentación
                            </Button>
                          </div>
                          {records.length > 0 ? (
                            <>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Cantidad</TableHead>
                                    <TableHead>Costo</TableHead>
                                    <TableHead>Fecha</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {records.map((record) => (
                                    <TableRow key={record.id}>
                                      <TableCell className="font-medium">{record.feedType}</TableCell>
                                      <TableCell className="text-muted-foreground">
                                        {record.quantity ? `${record.quantity} ${record.unit ?? ""}` : "—"}
                                      </TableCell>
                                      <TableCell className="text-muted-foreground">{record.cost ? `Bs ${record.cost}` : "—"}</TableCell>
                                      <TableCell className="text-muted-foreground">{formatDate(record.feedDate)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              <PaginationControls
                                page={feedMeta.page}
                                pages={feedMeta.pages}
                                onPageChange={(nextPage) => setFeedPageByLot((prev) => ({ ...prev, [lot.id]: nextPage }))}
                                className="px-4 pb-3"
                              />
                            </>
                          ) : (
                            <p className="px-4 pb-3 text-sm text-muted-foreground">Sin registros de alimentación todavía.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </FadeIn>

      <FatteningEntryDialog idRanch={ranchId} open={isEntryOpen} onOpenChange={setIsEntryOpen} onCreated={load} />
      <WeightRecordDialog
        idRanch={ranchId}
        animal={weightAnimal}
        open={!!weightAnimal}
        onOpenChange={(open) => {
          if (!open) setWeightAnimal(null);
        }}
        onCreated={load}
      />
      <FeedRecordDialog
        lot={feedLot}
        open={!!feedLot}
        onOpenChange={(open) => {
          if (!open) setFeedLot(null);
        }}
        onCreated={load}
      />
    </div>
  );
}
