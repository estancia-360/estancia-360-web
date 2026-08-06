import { useEffect, useState, useCallback } from "react";
import { RefreshCcw, ArrowLeftRight, PlusCircle, DollarSign, ShoppingCart, LogOut, Skull } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FadeIn } from "@/components/layout/fade-in";
import { StatTile } from "@/components/layout/stat-tile";
import { ModuleIcon } from "@/components/layout/module-icon";
import { PaginationControls } from "@/components/layout/pagination-controls";
import { SaleDialog } from "@/features/movements/components/sale-dialog";
import { PurchaseDialog } from "@/features/movements/components/purchase-dialog";
import { TransferDialog } from "@/features/movements/components/transfer-dialog";
import { RanchExitDialog } from "@/features/movements/components/ranch-exit-dialog";
import { AnimalExitDialog } from "@/features/movements/components/animal-exit-dialog";
import { MovementDetailDialog } from "@/features/movements/components/movement-detail-dialog";
import { getMovements } from "@/features/movements/api/movements-api";
import { MOVEMENT_STATUS_LABELS, MOVEMENT_TYPE_LABELS, type Movement } from "@/features/movements/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";

const MOVEMENT_TYPE_STYLE: Record<string, string> = {
  sale: "bg-brand-orange/15 text-brand-orange-dark",
  purchase: "bg-brand-green/10 text-brand-green",
  pasture_transfer: "bg-brand-blue/10 text-brand-blue",
  ranch_exit: "bg-destructive/10 text-destructive",
};

const MOVEMENT_STATUS_STYLE: Record<string, string> = {
  pending: "bg-brand-orange/15 text-brand-orange-dark",
  confirmed: "bg-brand-green/10 text-brand-green",
  cancelled: "bg-muted text-muted-foreground",
};

const ROW_CLASS = "border-b transition-colors hover:bg-muted/50";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("es-BO", { timeZone: "UTC" });
}

export function MovementsPage() {
  const { session } = useAuth();
  const { ranch } = useRanchSubscription();
  const ranchId = ranch.id;

  const [movements, setMovements] = useState<Movement[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState<null | "sale" | "purchase" | "transfer" | "ranch_exit" | "animal_exit">(null);
  const [detailMovement, setDetailMovement] = useState<Movement | null>(null);

  const load = useCallback(() => {
    if (!session) return;
    getMovements(ranchId, page, session.accessToken)
      .then((res) => {
        setMovements(res.data);
        setMeta(res.meta);
        // El dialog de detalle queda abierto entre acciones (aceptar/rechazar
        // varios animales de la misma venta) — si no resincronizamos acá, se
        // queda mostrando el estado viejo aunque la lista de fondo ya se actualizó.
        setDetailMovement((current) => (current ? (res.data.find((m) => m.id === current.id) ?? current) : current));
      })
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los movimientos.")))
      .finally(() => setIsLoading(false));
  }, [session, ranchId, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = () => {
    setIsLoading(true);
    load();
  };

  const pendingCount = movements.filter((m) => m.status === "pending").length;
  const confirmedCount = movements.filter((m) => m.status === "confirmed").length;

  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ModuleIcon icon={ArrowLeftRight} color="orange" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-blue">Movimientos</h1>
            <p className="text-sm text-muted-foreground">Ventas, compras, traslados, salidas y bajas.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw data-icon="inline-start" />
            Actualizar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button size="sm" />}>
              <PlusCircle data-icon="inline-start" />
              Nuevo movimiento
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setOpenDialog("sale")}>
                <DollarSign />
                Venta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenDialog("purchase")}>
                <ShoppingCart />
                Compra
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenDialog("transfer")}>
                <ArrowLeftRight />
                Traslado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenDialog("ranch_exit")}>
                <LogOut />
                Salida a otra estancia
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenDialog("animal_exit")}>
                <Skull />
                Baja (muerte/descarte/pérdida)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </FadeIn>

      {!isLoading && movements.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          <StatTile icon={ArrowLeftRight} color="orange" label="Movimientos" value={meta.total} delay={0} />
          <StatTile icon={PlusCircle} color="blue" label="Pendientes" value={pendingCount} delay={60} />
          <StatTile icon={DollarSign} color="green" label="Confirmados" value={confirmedCount} delay={120} />
        </div>
      ) : null}

      <FadeIn delay={100}>
        <Card>
          <CardHeader>
            <CardTitle>Historial de movimientos</CardTitle>
            <CardDescription>
              {meta.total} {meta.total === 1 ? "movimiento" : "movimientos"}
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
            ) : movements.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="size-12 rounded-full bg-brand-orange/15 text-brand-orange-dark">
                    <ArrowLeftRight className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>No hay movimientos todavía</EmptyTitle>
                  <EmptyDescription>Registrá el primero con el botón de arriba.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Contraparte</TableHead>
                      <TableHead>Animales</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement, index) => (
                      <motion.tr
                        key={movement.id}
                        className={ROW_CLASS}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                      >
                        <TableCell>
                          <Badge className={MOVEMENT_TYPE_STYLE[movement.movementType]}>
                            {MOVEMENT_TYPE_LABELS[movement.movementType]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {movement.counterpartName ?? movement.originName ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{movement.animals.length}</TableCell>
                        <TableCell>
                          <Badge className={MOVEMENT_STATUS_STYLE[movement.status]}>{MOVEMENT_STATUS_LABELS[movement.status]}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(movement.movementDate)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => setDetailMovement(movement)}>
                            Detalle
                          </Button>
                        </TableCell>
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

      <SaleDialog idRanch={ranchId} open={openDialog === "sale"} onOpenChange={(o) => setOpenDialog(o ? "sale" : null)} onCreated={load} />
      <PurchaseDialog
        idRanch={ranchId}
        open={openDialog === "purchase"}
        onOpenChange={(o) => setOpenDialog(o ? "purchase" : null)}
        onCreated={load}
      />
      <TransferDialog
        idRanch={ranchId}
        open={openDialog === "transfer"}
        onOpenChange={(o) => setOpenDialog(o ? "transfer" : null)}
        onCreated={load}
      />
      <RanchExitDialog
        idRanch={ranchId}
        open={openDialog === "ranch_exit"}
        onOpenChange={(o) => setOpenDialog(o ? "ranch_exit" : null)}
        onCreated={load}
      />
      <AnimalExitDialog
        idRanch={ranchId}
        open={openDialog === "animal_exit"}
        onOpenChange={(o) => setOpenDialog(o ? "animal_exit" : null)}
        onCreated={load}
      />
      <MovementDetailDialog
        movement={detailMovement}
        open={!!detailMovement}
        onOpenChange={(open) => {
          if (!open) setDetailMovement(null);
        }}
        onUpdated={load}
      />
    </div>
  );
}
