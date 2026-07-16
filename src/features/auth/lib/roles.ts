// Espeja RoleEnum del backend (src/shared/enums) — no cambiar sin sincronizar con la API.
export const RoleEnum = {
  ROOT: 1,
  ADMIN: 2,
  USER: 3,
} as const;

export function isAdminRole(idRole: number): boolean {
  return idRole === RoleEnum.ROOT || idRole === RoleEnum.ADMIN;
}
