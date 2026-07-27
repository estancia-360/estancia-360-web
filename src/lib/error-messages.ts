import { ApiError } from "@/lib/api-client";

/**
 * El backend responde en inglés (`error: "USER_ALREADY_EXISTS"`, `message: "..."`).
 * Este diccionario traduce los códigos que el usuario puede llegar a ver a un
 * mensaje en español entendible. Si un código todavía no está mapeado, se usa
 * un mensaje genérico en vez de mostrar el inglés crudo del backend — agregar
 * la entrada acá a medida que se detecten nuevos códigos en producción.
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  INVALID_CREDENTIALS: "Correo o contraseña incorrectos.",
  INVALID_TOKEN: "Tu sesión expiró. Volvé a iniciar sesión.",
  INSUFFICIENT_PERMISSIONS: "No tenés permisos para realizar esta acción.",

  // Usuarios
  USER_ALREADY_EXISTS: "Ya existe un usuario registrado con ese correo o carnet de identidad.",
  USER_NOT_FOUND: "No se encontró el usuario.",

  // Suscripciones / pagos
  RANCH_SUBSCRIPTION_NOT_FOUND: "No se encontró la suscripción de esta estancia.",
  RANCH_NOT_FOUND: "No se encontró la estancia.",
  SUBSCRIPTION_PLAN_NOT_FOUND: "El plan seleccionado no existe.",
  BILLING_CYCLE_REQUIRED: "Elegí un ciclo de facturación (mensual o anual) para este plan.",
  SUBSCRIPTION_CAPACITY_EXCEEDED: "La estancia alcanzó el límite de animales de su plan actual.",
};

/**
 * Traduce un error capturado (idealmente un ApiError) a un mensaje en español
 * listo para mostrar al usuario (toast, alerta de formulario, etc.).
 */
export function translateError(error: unknown, fallback = "Ocurrió un error inesperado. Intentá de nuevo."): string {
  if (error instanceof ApiError) {
    if (error.errorCode && ERROR_MESSAGES[error.errorCode]) {
      return ERROR_MESSAGES[error.errorCode];
    }
    if (error.statusCode === 400 && error.message) {
      // Errores de validación del backend (class-validator) ya vienen en un
      // texto razonable en inglés técnico ("email must be an email") — no hay
      // traducción 1:1 posible sin mapear cada campo, así que se muestra el
      // mensaje tal cual solo en este caso puntual (validación de formulario).
      return error.message;
    }
    if (error.statusCode >= 500) {
      return "Hubo un problema en el servidor. Intentá de nuevo en unos minutos.";
    }
  }
  return fallback;
}
