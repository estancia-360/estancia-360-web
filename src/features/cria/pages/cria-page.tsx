import { useEffect, useState, useCallback } from "react";
import { PlusCircle, RefreshCcw, Baby, Heart, Syringe, FlaskConical, Stethoscope, ArrowRightCircle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FadeIn } from "@/components/layout/fade-in";
import { StatTile } from "@/components/layout/stat-tile";
import { ModuleIcon } from "@/components/layout/module-icon";
import { RegisterBreedingServiceDialog } from "@/features/cria/components/register-breeding-service-dialog";
import { GestationDiagnosisDialog } from "@/features/cria/components/gestation-diagnosis-dialog";
import { ParturitionDialog } from "@/features/cria/components/parturition-dialog";
import { WeaningDialog } from "@/features/cria/components/weaning-dialog";
import {
  getBreedingServices,
  getGestationDiagnoses,
  getParturitions,
  getWeanings,
} from "@/features/cria/api/cria-api";
import {
  SERVICE_TYPE_LABELS,
  GESTATION_METHOD_LABELS,
  GESTATION_RESULT_LABELS,
  BIRTH_TYPE_LABELS,
  CRIA_STATUS_LABELS,
  type BreedingService,
  type GestationDiagnosis,
  type Parturition,
  type Weaning,
  type ServiceType,
} from "@/features/cria/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";

const SERVICE_TYPE_STYLE: Record<ServiceType, { icon: typeof Heart; className: string }> = {
  natural: { icon: Heart, className: "bg-brand-green/10 text-brand-green" },
  artificial_insemination: { icon: Syringe, className: "bg-brand-blue/10 text-brand-blue" },
  embryo_transfer: { icon: FlaskConical, className: "bg-brand-orange/15 text-brand-orange-dark" },
};

const ROW_CLASS = "border-b transition-colors hover:bg-muted/50";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("es-BO", { timeZone: "UTC" });
}

export function CriaPage() {
  const { session } = useAuth();
  const { ranch } = useRanchSubscription();
  const ranchId = ranch.id;

  const [services, setServices] = useState<BreedingService[]>([]);
  const [diagnoses, setDiagnoses] = useState<GestationDiagnosis[]>([]);
  const [parturitions, setParturitions] = useState<Parturition[]>([]);
  const [weanings, setWeanings] = useState<Weaning[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [diagnosisService, setDiagnosisService] = useState<BreedingService | null>(null);
  const [parturitionDiagnosis, setParturitionDiagnosis] = useState<GestationDiagnosis | null>(null);
  const [weaningParturition, setWeaningParturition] = useState<Parturition | null>(null);

  const load = useCallback(() => {
    if (!session) return;
    Promise.all([
      getBreedingServices(ranchId, 1, session.accessToken),
      getGestationDiagnoses(ranchId, 1, session.accessToken),
      getParturitions(ranchId, 1, session.accessToken),
      getWeanings(ranchId, 1, session.accessToken),
    ])
      .then(([servicesRes, diagnosesRes, parturitionsRes, weaningsRes]) => {
        setServices(servicesRes.data);
        setDiagnoses(diagnosesRes.data);
        setParturitions(parturitionsRes.data);
        setWeanings(weaningsRes.data);
      })
      .catch((error) => toast.error(translateError(error, "No se pudo cargar el ciclo de cría.")))
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
          <ModuleIcon icon={Baby} color="orange" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-blue">Cría</h1>
            <p className="text-sm text-muted-foreground">Servicio → Diagnóstico → Parto → Destete.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCcw data-icon="inline-start" />
          Actualizar
        </Button>
      </FadeIn>

      {!isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile icon={Heart} color="orange" label="Servicios" value={services.length} delay={0} />
          <StatTile icon={Stethoscope} color="blue" label="Diagnósticos" value={diagnoses.length} delay={60} />
          <StatTile icon={Baby} color="green" label="Partos" value={parturitions.length} delay={120} />
          <StatTile icon={ArrowRightCircle} color="accent" label="Destetes" value={weanings.length} delay={180} />
        </div>
      ) : null}

      <FadeIn delay={100}>
        <Card>
          <CardContent>
            <Tabs defaultValue="services">
              <TabsList>
                <TabsTrigger value="services">Servicios</TabsTrigger>
                <TabsTrigger value="diagnoses">Diagnósticos</TabsTrigger>
                <TabsTrigger value="parturitions">Partos</TabsTrigger>
                <TabsTrigger value="weanings">Destetes</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <CardTitle>Servicios de monta</CardTitle>
                  <Button size="sm" onClick={() => setIsServiceOpen(true)}>
                    <PlusCircle data-icon="inline-start" />
                    Nuevo servicio
                  </Button>
                </div>
                {isLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : services.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="size-12 rounded-full bg-brand-orange/15 text-brand-orange-dark">
                        <Heart className="size-6" />
                      </EmptyMedia>
                      <EmptyTitle>No hay servicios registrados</EmptyTitle>
                      <EmptyDescription>Registrá el primero con el botón de arriba.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hembra</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Técnico</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service, index) => {
                        const style = SERVICE_TYPE_STYLE[service.serviceType];
                        return (
                          <motion.tr
                            key={service.id}
                            className={ROW_CLASS}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                          >
                            <TableCell className="font-medium">{service.event.animal.code}</TableCell>
                            <TableCell>
                              <Badge className={style.className}>
                                <style.icon data-icon="inline-start" />
                                {SERVICE_TYPE_LABELS[service.serviceType]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{service.technician ?? "—"}</TableCell>
                            <TableCell className="text-muted-foreground">{formatDate(service.event.eventDate)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => setDiagnosisService(service)}>
                                <Stethoscope data-icon="inline-start" />
                                Diagnóstico
                              </Button>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="diagnoses" className="pt-4">
                <CardTitle className="mb-3">Diagnósticos de gestación</CardTitle>
                {isLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : diagnoses.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="size-12 rounded-full bg-brand-blue/10 text-brand-blue">
                        <Stethoscope className="size-6" />
                      </EmptyMedia>
                      <EmptyTitle>No hay diagnósticos todavía</EmptyTitle>
                      <EmptyDescription>Se registran desde la pestaña de Servicios.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hembra</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Resultado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {diagnoses.map((diagnosis, index) => (
                        <motion.tr
                          key={diagnosis.id}
                          className={ROW_CLASS}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                        >
                          <TableCell className="font-medium">{diagnosis.event.animal.code}</TableCell>
                          <TableCell className="text-muted-foreground">{GESTATION_METHOD_LABELS[diagnosis.method]}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                diagnosis.result === "pregnant"
                                  ? "bg-brand-green/10 text-brand-green"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {GESTATION_RESULT_LABELS[diagnosis.result]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(diagnosis.event.eventDate)}</TableCell>
                          <TableCell className="text-right">
                            {diagnosis.result === "pregnant" ? (
                              <Button variant="outline" size="sm" onClick={() => setParturitionDiagnosis(diagnosis)}>
                                <Baby data-icon="inline-start" />
                                Parto
                              </Button>
                            ) : null}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="parturitions" className="pt-4">
                <CardTitle className="mb-3">Partos</CardTitle>
                {isLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : parturitions.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="size-12 rounded-full bg-brand-green/10 text-brand-green">
                        <Baby className="size-6" />
                      </EmptyMedia>
                      <EmptyTitle>No hay partos todavía</EmptyTitle>
                      <EmptyDescription>Se registran desde la pestaña de Diagnósticos.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Madre</TableHead>
                        <TableHead>Tipo de parto</TableHead>
                        <TableHead>Cría</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parturitions.map((parturition, index) => (
                        <motion.tr
                          key={parturition.id}
                          className={ROW_CLASS}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                        >
                          <TableCell className="font-medium">{parturition.event.animal.code}</TableCell>
                          <TableCell className="text-muted-foreground">{BIRTH_TYPE_LABELS[parturition.birthType]}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                parturition.criaStatus === "alive"
                                  ? "bg-brand-green/10 text-brand-green"
                                  : "bg-destructive/10 text-destructive"
                              }
                            >
                              {parturition.cria ? `${parturition.cria.code} · ` : ""}
                              {CRIA_STATUS_LABELS[parturition.criaStatus]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(parturition.event.eventDate)}</TableCell>
                          <TableCell className="text-right">
                            {parturition.criaStatus === "alive" && parturition.cria ? (
                              <Button variant="outline" size="sm" onClick={() => setWeaningParturition(parturition)}>
                                <ArrowRightCircle data-icon="inline-start" />
                                Destete
                              </Button>
                            ) : null}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="weanings" className="pt-4">
                <CardTitle className="mb-3">Destetes</CardTitle>
                {isLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : weanings.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="size-12 rounded-full bg-brand-accent/15 text-brand-green-dark">
                        <ArrowRightCircle className="size-6" />
                      </EmptyMedia>
                      <EmptyTitle>No hay destetes todavía</EmptyTitle>
                      <EmptyDescription>Se registran desde la pestaña de Partos.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cría</TableHead>
                        <TableHead>Peso al destete</TableHead>
                        <TableHead>Edad (días)</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weanings.map((weaning, index) => (
                        <motion.tr
                          key={weaning.id}
                          className={ROW_CLASS}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                        >
                          <TableCell className="font-medium">{weaning.cria?.code ?? weaning.event.animal.code}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {weaning.weaningWeight ? `${weaning.weaningWeight} kg` : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{weaning.weaningAge ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(weaning.event.eventDate)}</TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </FadeIn>

      <RegisterBreedingServiceDialog idRanch={ranchId} open={isServiceOpen} onOpenChange={setIsServiceOpen} onCreated={load} />
      <GestationDiagnosisDialog
        service={diagnosisService}
        open={!!diagnosisService}
        onOpenChange={(open) => {
          if (!open) setDiagnosisService(null);
        }}
        onCreated={load}
      />
      <ParturitionDialog
        diagnosis={parturitionDiagnosis}
        open={!!parturitionDiagnosis}
        onOpenChange={(open) => {
          if (!open) setParturitionDiagnosis(null);
        }}
        onCreated={load}
      />
      <WeaningDialog
        idRanch={ranchId}
        parturition={weaningParturition}
        open={!!weaningParturition}
        onOpenChange={(open) => {
          if (!open) setWeaningParturition(null);
        }}
        onCreated={load}
      />
    </div>
  );
}
