import { useEffect, useState, useCallback } from "react";
import { UserPlus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { RegisterRanchMemberDialog } from "@/features/ranch/components/register-ranch-member-dialog";
import { getRanchMembers } from "@/features/ranch/api/members-api";
import type { RanchMember } from "@/features/ranch/types/members";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";

const ROLE_VARIANT: Record<number, "default" | "secondary" | "outline"> = {
  1: "default", // Dueño
  2: "secondary", // Trabajador
  3: "outline", // Administrador
};

export function RanchTeamPage() {
  const { session } = useAuth();
  const { ranch } = useRanchSubscription();
  const [members, setMembers] = useState<RanchMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-blue">Equipo</h1>
          <p className="text-sm text-muted-foreground">Quiénes tienen acceso a {ranch.name}.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw data-icon="inline-start" />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <UserPlus data-icon="inline-start" />
            Nuevo miembro
          </Button>
        </div>
      </div>

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
                <EmptyTitle>No hay miembros todavía</EmptyTitle>
                <EmptyDescription>Agregá trabajadores o administradores con el botón de arriba.</EmptyDescription>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.idUser}>
                    <TableCell className="font-medium">
                      {member.user.fullname} {member.user.paternalSurname}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.user.email}</TableCell>
                    <TableCell className="text-muted-foreground">{member.user.ci}</TableCell>
                    <TableCell>
                      <Badge variant={ROLE_VARIANT[member.role.id] ?? "outline"}>{member.role.name}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RegisterRanchMemberDialog idRanch={ranch.id} open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreated={load} />
    </div>
  );
}
