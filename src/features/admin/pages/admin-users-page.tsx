import { useEffect, useState, useCallback } from "react";
import { UserPlus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { CreateAdminUserDialog } from "@/features/admin/components/create-admin-user-dialog";
import { getAdminUsers } from "@/features/admin/api/users-api";
import type { AdminUser } from "@/features/admin/types/users";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

function formatDateTime(value: string): string {
  return new Date(value).toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function AdminUsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadUsers = useCallback(() => {
    if (!session) return;
    getAdminUsers(session.accessToken)
      .then(({ users }) => setUsers(users))
      .catch((error) => {
        toast.error(translateError(error, "No se pudieron cargar los administradores."));
      })
      .finally(() => setIsLoading(false));
  }, [session]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRefresh = () => {
    setIsLoading(true);
    loadUsers();
  };

  const handleCreated = (user: AdminUser) => {
    setUsers((prev) => [user, ...prev]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-blue">Usuarios administradores</h1>
          <p className="text-sm text-muted-foreground">Quiénes tienen acceso al panel admin de Estancia360.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw data-icon="inline-start" />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <UserPlus data-icon="inline-start" />
            Nuevo administrador
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipo admin</CardTitle>
          <CardDescription>
            {users.length} {users.length === 1 ? "administrador" : "administradores"}
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
          ) : users.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No hay administradores todavía</EmptyTitle>
                <EmptyDescription>Creá el primero con el botón de arriba.</EmptyDescription>
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
                  <TableHead>Alta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.fullname} {user.paternalSurname}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">{user.ci}</TableCell>
                    <TableCell>
                      <Badge variant={user.roleId === 1 ? "default" : "secondary"}>{user.role.name}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(user.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateAdminUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreated={handleCreated} />
    </div>
  );
}
