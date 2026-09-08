import { useEffect, useState, useCallback, useMemo } from "react";
import { UserPlus, RefreshCcw, Users, Crown, HardHat, ShieldCheck, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { FadeIn } from "@/components/layout/fade-in";
import { StatTile } from "@/components/layout/stat-tile";
import { ModuleIcon } from "@/components/layout/module-icon";
import { RegisterRanchMemberDialog } from "@/features/ranch/components/register-ranch-member-dialog";
import { RemoveRanchMemberDialog } from "@/features/ranch/components/remove-ranch-member-dialog";
import { getRanchMembers, removeRanchMember } from "@/features/ranch/api/members-api";
import type { RanchMember } from "@/features/ranch/types/members";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";

const OWNER_ROLE_ID = 1;

const ROLE_STYLE: Record<number, { label: string; icon: typeof Crown; className: string }> = {
  1: { label: "Dueño", icon: Crown, className: "bg-brand-blue text-white" },
  2: { label: "Trabajador", icon: HardHat, className: "bg-brand-accent/20 text-brand-green-dark" },
  3: { label: "Administrador", icon: ShieldCheck, className: "bg-brand-orange/15 text-brand-orange-dark" },
};

const AVATAR_STYLE: Record<number, string> = {
  1: "bg-brand-blue text-white",
  2: "bg-brand-accent text-white",
  3: "bg-brand-orange text-white",
};

const ROW_CLASS = "border-b transition-colors hover:bg-muted/50";

function initialsOf(fullname: string, paternalSurname: string): string {
  return `${fullname[0] ?? ""}${paternalSurname[0] ?? ""}`.toUpperCase();
}

export function RanchTeamPage() {
  const { session } = useAuth();
  const { ranch } = useRanchSubscription();
  const [members, setMembers] = useState<RanchMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<RanchMember | null>(null);

  const load = useCallback(() => {
    if (!session) return;
    getRanchMembers(ranch.id, session.accessToken)
      .then(({ members }) => setMembers(members))
      .catch((error) => toast.error(translateError(error, "No se pudo cargar el equipo.")))
      .finally(() => setIsLoading(false));
  }, [session, ranch.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = () => {
    setIsLoading(true);
    load();
  };

  const handleRemove = async () => {
    if (!session || !memberToRemove) return;
    try {
      await removeRanchMember(ranch.id, memberToRemove.idUser, session.accessToken);
      toast.success(`${memberToRemove.user.fullname} ya no forma parte del equipo`);
      load();
    } catch (error) {
      toast.error(translateError(error, "No se pudo eliminar al miembro."));
      throw error;
    }
  };

  const counts = useMemo(
    () => ({
      workers: members.filter((m) => m.role.id === 2).length,
      admins: members.filter((m) => m.role.id === 3).length,
    }),
    [members],
  );

  // Agregar/eliminar miembros es exclusivo del Dueño (backend lo exige) — se ocultan
  // esos controles para el resto en vez de dejar que fallen al hacer clic.
  const isCurrentUserOwner = members.some((m) => m.idUser === session?.idUser && m.role.id === OWNER_ROLE_ID);

  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ModuleIcon icon={Users} color="blue" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-blue">Equipo</h1>
            <p className="text-sm text-muted-foreground">Quiénes tienen acceso a {ranch.name}.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw data-icon="inline-start" />
            Actualizar
          </Button>
          {isCurrentUserOwner ? (
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <UserPlus data-icon="inline-start" />
              Nuevo miembro
            </Button>
          ) : null}
        </div>
      </FadeIn>

      {!isLoading && members.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile icon={Users} color="blue" label="Miembros del equipo" value={members.length} delay={0} />
          <StatTile icon={HardHat} color="accent" label="Trabajadores" value={counts.workers} delay={60} />
          <StatTile icon={ShieldCheck} color="orange" label="Administradores" value={counts.admins} delay={120} />
        </div>
      ) : null}

      <FadeIn delay={100}>
        <Card>
          <CardHeader>
            <CardTitle>Miembros de la estancia</CardTitle>
            <CardDescription>
              {members.length} {members.length === 1 ? "persona" : "personas"}
            </CardDescription>
            <CardAction />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : members.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="size-12 rounded-full bg-brand-blue/10 text-brand-blue">
                    <Users className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>No hay miembros todavía</EmptyTitle>
                  <EmptyDescription>
                    {isCurrentUserOwner ? "Agregá administradores con el botón de arriba." : "El dueño de la estancia todavía no agregó a nadie."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>CI</TableHead>
                    <TableHead>Rol</TableHead>
                    {isCurrentUserOwner ? <TableHead className="w-0" /> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member, index) => {
                    const role = ROLE_STYLE[member.role.id];
                    const isOwner = member.role.id === OWNER_ROLE_ID;
                    return (
                      <motion.tr
                        key={member.idUser}
                        className={ROW_CLASS}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2.5">
                            <Avatar size="sm">
                              <AvatarFallback className={AVATAR_STYLE[member.role.id]}>
                                {initialsOf(member.user.fullname, member.user.paternalSurname)}
                              </AvatarFallback>
                            </Avatar>
                            {member.user.fullname} {member.user.paternalSurname}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{member.user.email}</TableCell>
                        <TableCell className="text-muted-foreground">{member.user.ci}</TableCell>
                        <TableCell>
                          <Badge className={role?.className}>
                            {role ? <role.icon data-icon="inline-start" /> : null}
                            {role?.label ?? member.role.name}
                          </Badge>
                        </TableCell>
                        {isCurrentUserOwner ? (
                          <TableCell>
                            {isOwner ? null : (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => setMemberToRemove(member)}
                              >
                                <Trash2 />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            )}
                          </TableCell>
                        ) : null}
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      <RegisterRanchMemberDialog idRanch={ranch.id} open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreated={load} />
      {memberToRemove ? (
        <RemoveRanchMemberDialog
          open={memberToRemove !== null}
          onOpenChange={(open) => {
            if (!open) setMemberToRemove(null);
          }}
          memberName={`${memberToRemove.user.fullname} ${memberToRemove.user.paternalSurname}`}
          onConfirm={handleRemove}
        />
      ) : null}
    </div>
  );
}
