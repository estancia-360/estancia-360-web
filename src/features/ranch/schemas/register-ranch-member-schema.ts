import { z } from "zod";

export const registerRanchMemberSchema = z.object({
  ci: z.string().min(5, "El CI debe tener al menos 5 caracteres").max(20, "El CI es demasiado largo"),
  fullname: z.string().min(3, "El nombre completo es muy corto").max(150, "El nombre completo es muy largo"),
  paternalSurname: z.string().min(2, "El apellido paterno es muy corto").max(100, "El apellido paterno es muy largo"),
  maternalSurname: z.string().min(2, "El apellido materno es muy corto").max(100, "El apellido materno es muy largo"),
  email: z.string().min(1, "El correo es obligatorio").email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  celphone: z.string().optional(),
});

export type RegisterRanchMemberValues = z.infer<typeof registerRanchMemberSchema>;
