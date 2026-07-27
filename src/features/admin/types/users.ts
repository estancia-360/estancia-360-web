export interface AdminRole {
  id: number;
  name: string;
}

export interface AdminUser {
  id: number;
  roleId: number;
  ci: string;
  fullname: string;
  paternalSurname: string;
  maternalSurname: string;
  email: string;
  celphone: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  role: AdminRole;
}
