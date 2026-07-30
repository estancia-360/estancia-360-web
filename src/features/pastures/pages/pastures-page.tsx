import { useEffect, useState, useCallback, useMemo } from "react";
import { PlusCircle, RefreshCcw, Fence, Group, Beef, Ruler, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { FadeIn } from "@/components/layout/fade-in";
import { StatTile } from "@/components/layout/stat-tile";
import { ModuleIcon } from "@/components/layout/module-icon";
import { PastureDialog } from "@/features/pastures/components/pasture-dialog";
import { LotDialog } from "@/features/pastures/components/lot-dialog";
import { ConfirmDeleteDialog } from "@/features/pastures/components/confirm-delete-dialog";
import { getRanchPastures, getRanchLots, deleteRanchPasture, deleteRanchLot } from "@/features/pastures/api/pastures-api";
import { LOT_TYPE_LABELS, type RanchPasture, type RanchLot, type LotType } from "@/features/pastures/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";

const LOT_TYPE_STYLE: Record<LotType, string> = {
  cria: "bg-brand-orange/15 text-brand-orange-dark",
  recria: "bg-brand-blue/10 text-brand-blue",
  engorde: "bg-brand-green/10 text-brand-green",
  reproductiva: "bg-violet-500/10 text-violet-700",
  general: "bg-muted text-muted-foreground",
};

type DeleteTarget = { type: "pasture"; id: number; name: string } | { type: "lot"; id: number; name: string };

export function PasturesPage() {
  const { session } = useAuth();
  const { ranch } = useRanchSubscription();
  const ranchId = ranch.id;

  const [pastures, setPastures] = useState<RanchPasture[]>([]);
  const [lots, setLots] = useState<RanchLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isPastureDialogOpen, setIsPastureDialogOpen] = useState(false);
  const [editingPasture, setEditingPasture] = useState<RanchPasture | null>(null);

  const [isLotDialogOpen, setIsLotDialogOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<RanchLot | null>(null);
  const [lotDialogPastureId, setLotDialogPastureId] = useState<number | undefined>(undefined);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const load = useCallback(() => {
    if (!session) return;
    Promise.all([getRanchPastures(ranchId, session.accessToken), getRanchLots(ranchId, session.accessToken)])
      .then(([pasturesRes, lotsRes]) => {
        setPastures(pasturesRes);
        setLots(lotsRes);
      })
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los potreros.")))
      .finally(() => setIsLoading(false));
  }, [session, ranchId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = () => {
    setIsLoading(true);
    load();
  };

  const lotsByPasture = useMemo(() => {
    const map = new Map<number, RanchLot[]>();
    for (const lot of lots) {
      const arr = map.get(lot.idRanchPasture) ?? [];
      arr.push(lot);
      map.set(lot.idRanchPasture, arr);
    }
    return map;
  }, [lots]);

  const totals = useMemo(
    () => ({
      pastures: pastures.length,
      lots: lots.length,
      animals: lots.reduce((sum, l) => sum + (l.animalsCount ?? 0), 0),
      hectares: Math.round(pastures.reduce((sum, p) => sum + Number(p.areaHectares), 0)),
    }),
    [pastures, lots],
  );

  const openNewPasture = () => {
    setEditingPasture(null);
    setIsPastureDialogOpen(true);
  };
  const openEditPasture = (pasture: RanchPasture) => {
    setEditingPasture(pasture);
    setIsPastureDialogOpen(true);
  };
  const openNewLot = (idRanchPasture: number) => {
    setEditingLot(null);
    setLotDialogPastureId(idRanchPasture);
    setIsLotDialogOpen(true);
  };
  const openEditLot = (lot: RanchLot) => {
    setEditingLot(lot);
    setLotDialogPastureId(lot.idRanchPasture);
    setIsLotDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!session || !deleteTarget) return;
    try {
      if (deleteTarget.type === "pasture") {
        await deleteRanchPasture(deleteTarget.id, session.accessToken);
        toast.success(`Potrero ${deleteTarget.name} eliminado`);
      } else {
        await deleteRanchLot(deleteTarget.id, session.accessToken);
        toast.success(`Lote ${deleteTarget.name} eliminado`);
      }
      load();
    } catch (error) {
      toast.error(translateError(error, "No se pudo eliminar."));
      throw error;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ModuleIcon icon={Fence} color="accent" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-blue">Potreros y Lotes</h1>
            <p className="text-sm text-muted-foreground">Divisiones de campo y agrupación de animales de tu estancia.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw data-icon="inline-start" />
            Actualizar
          </Button>
          <Button size="sm" onClick={openNewPasture}>
            <PlusCircle data-icon="inline-start" />
            Nuevo potrero
          </Button>
        </div>
      </FadeIn>

      {!isLoading && pastures.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile icon={Fence} color="accent" label="Potreros" value={totals.pastures} delay={0} />
          <StatTile icon={Group} color="blue" label="Lotes" value={totals.lots} delay={60} />
          <StatTile icon={Beef} color="green" label="Animales" value={totals.animals} delay={120} />
          <StatTile icon={Ruler} color="orange" label="Hectáreas" value={totals.hectares} delay={180} />
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : pastures.length === 0 ? (
        <Card>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon" className="size-12 rounded-full bg-brand-accent/15 text-brand-green-dark">
                  <Fence className="size-6" />
                </EmptyMedia>
                <EmptyTitle>No hay potreros todavía</EmptyTitle>
                <EmptyDescription>Registrá el primero con el botón de arriba.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {pastures.map((pasture, index) => {
            const pastureLots = lotsByPasture.get(pasture.id) ?? [];
            const pastureAnimals = pastureLots.reduce((sum, l) => sum + (l.animalsCount ?? 0), 0);
            return (
              <motion.div
                key={pasture.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <ModuleIcon icon={Fence} color="accent" size="sm" />
                      <div>
                        <CardTitle>{pasture.name}</CardTitle>
                        <CardDescription>
                          {Number(pasture.areaHectares)} ha · {pastureLots.length} {pastureLots.length === 1 ? "lote" : "lotes"} ·{" "}
                          {pastureAnimals} {pastureAnimals === 1 ? "animal" : "animales"}
                          {pasture.description ? ` · ${pasture.description}` : ""}
                        </CardDescription>
                      </div>
                    </div>
                    <CardAction className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" aria-label="Editar potrero" onClick={() => openEditPasture(pasture)}>
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Eliminar potrero"
                        onClick={() => setDeleteTarget({ type: "pasture", id: pasture.id, name: pasture.name })}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    {pastureLots.length === 0 ? (
                      <div className="flex items-center justify-between rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                        <span>Este potrero todavía no tiene lotes.</span>
                        <Button variant="outline" size="sm" onClick={() => openNewLot(pasture.id)}>
                          <PlusCircle data-icon="inline-start" />
                          Nuevo lote
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {pastureLots.map((lot) => {
                          const count = lot.animalsCount ?? 0;
                          const isFull = !!lot.capacity && count >= lot.capacity;
                          return (
                            <div
                              key={lot.id}
                              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 ring-1 ring-foreground/10 transition-colors hover:bg-muted/40"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <Badge className={LOT_TYPE_STYLE[lot.lotType]}>{LOT_TYPE_LABELS[lot.lotType]}</Badge>
                                <span className="truncate font-medium">{lot.name}</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>
                                  {count}
                                  {lot.capacity ? ` / ${lot.capacity}` : ""} {count === 1 && !lot.capacity ? "animal" : "animales"}
                                </span>
                                {isFull ? <Badge className="bg-destructive/10 text-destructive">Lleno</Badge> : null}
                                <Button variant="ghost" size="icon" aria-label="Editar lote" onClick={() => openEditLot(lot)}>
                                  <Pencil className="size-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Eliminar lote"
                                  onClick={() => setDeleteTarget({ type: "lot", id: lot.id, name: lot.name })}
                                >
                                  <Trash2 className="size-3.5 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        <Button variant="outline" size="sm" className="self-start" onClick={() => openNewLot(pasture.id)}>
                          <PlusCircle data-icon="inline-start" />
                          Nuevo lote
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <PastureDialog
        idRanch={ranchId}
        open={isPastureDialogOpen}
        onOpenChange={setIsPastureDialogOpen}
        onSaved={load}
        pasture={editingPasture}
      />
      <LotDialog
        idRanch={ranchId}
        pastures={pastures}
        open={isLotDialogOpen}
        onOpenChange={setIsLotDialogOpen}
        onSaved={load}
        lot={editingLot}
        defaultPastureId={lotDialogPastureId}
      />
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={deleteTarget?.type === "pasture" ? "¿Eliminar este potrero?" : "¿Eliminar este lote?"}
        description={
          deleteTarget?.type === "pasture"
            ? `"${deleteTarget.name}" se va a eliminar. Si todavía tiene lotes, primero tenés que eliminarlos o moverlos.`
            : `"${deleteTarget?.name}" se va a eliminar. Si todavía tiene animales, primero tenés que moverlos a otro lote.`
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}
