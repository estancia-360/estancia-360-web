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
  SUBSCRIPTION_CAPACITY_EXCEEDED: "La estancia alcanzó el límite de animales de su plan actual. Actualizá el plan para agregar más.",

  // Equipo de la estancia
  RANCH_OWNER_ONLY: "Solo el dueño de la estancia puede hacer esto.",

  // Animales
  ANIMAL_NOT_FOUND: "No se encontró el animal.",
  ANIMAL_CODE_ALREADY_EXISTS: "Ya existe un animal registrado con ese código.",
  SAME_PARENT_CODE: "La madre y el padre no pueden ser el mismo animal.",

  // Cría
  ANIMAL_ALREADY_PREGNANT: "Este animal ya tiene un diagnóstico de preñez activo — no puede recibir un nuevo servicio hasta que termine ese ciclo.",
  BREEDING_SERVICE_NOT_FOUND: "No se encontró el servicio de monta.",
  GESTATION_DIAGNOSIS_NOT_FOUND: "No se encontró el diagnóstico de gestación.",
  DIAGNOSIS_NOT_PREGNANT: "Ese diagnóstico no confirma preñez — no se puede registrar un parto a partir de él.",
  PARTURITION_ALREADY_EXISTS: "Ese diagnóstico ya tiene un parto registrado.",
  PARTURITION_NOT_FOUND: "No se encontró el parto.",
  LOT_NOT_REARING_TYPE: "El lote de destino tiene que ser de tipo Recría.",
  WEANING_NOT_FOUND: "No se encontró el destete.",
  RANCH_ANIMAL_NOT_FOUND: "No se encontró el animal.",

  // Potreros y lotes
  RANCH_PASTURE_NOT_FOUND: "No se encontró el potrero.",
  RANCH_PASTURE_HAS_LOTS: "No se puede eliminar: el potrero todavía tiene lotes. Eliminá o movés los lotes primero.",
  RANCH_LOT_NOT_FOUND: "No se encontró el lote.",
  RANCH_LOT_HAS_ANIMALS: "No se puede eliminar: el lote todavía tiene animales. Movelos a otro lote primero.",

  // Rubros (RN-09)
  INVALID_PRODUCTION_TYPES_COMBINATION:
    "Combinación de rubros inválida. El orden es Cría → Recría → Engorde, sin saltos: Cría sola, Cría+Recría, o los 3.",
  RANCH_PRODUCTION_TYPE_NOT_ENABLED: "Tu estancia no tiene ese rubro habilitado.",

  // Recría
  WEIGHT_RECORD_NOT_FOUND: "No se encontró el registro de pesaje.",
  ANIMAL_IS_BAJA: "Este animal está dado de baja — no puede recibir más eventos.",
  ANIMAL_NOT_IN_REARING: "Este animal no está en la etapa de Recría.",
  REARING_SELECTION_NOT_FOUND: "No se encontró la selección de destino.",

  // Engorde
  FATTENING_ENTRY_NOT_FOUND: "No se encontró el ingreso a engorde.",
  FEED_RECORD_NOT_FOUND: "No se encontró el registro de alimentación.",

  // Movimientos
  MOVEMENT_NOT_FOUND: "No se encontró el movimiento.",
  MOVEMENT_ANIMAL_NOT_FOUND: "No se encontró el animal dentro de este movimiento.",
  ANIMAL_EXIT_NOT_FOUND: "No se encontró la baja.",
  RANCH_ACCESS_DENIED: "No pertenecés a esta estancia.",
  ONLY_OWNER_ALLOWED: "Solo el dueño de la estancia puede registrar esto.",
  PURCHASE_REQUIRES_NEW_ANIMAL: "Faltan los datos del animal a comprar.",
  ID_RANCH_ANIMAL_REQUIRED: "Falta elegir el animal.",
  ID_LOT_DEST_REQUIRED: "Falta elegir el lote de destino.",
  COUNTERPART_NAME_REQUIRED: "Falta el nombre de la contraparte.",
  DUPLICATED_ANIMAL_IN_MOVEMENT: "Hay un animal repetido en la lista.",
  ANIMAL_NOT_IN_RANCH: "Ese animal no pertenece a esta estancia.",
  ANIMAL_IN_PENDING_MOVEMENT: "Ese animal ya tiene un movimiento pendiente.",
  ANIMAL_UNDER_WITHDRAWAL: "Ese animal está en período de retiro por un tratamiento — no se puede vender todavía.",
  DUPLICATED_ANIMAL_CODE: "Ya existe un animal con ese código en la estancia.",
  MOVEMENT_NOT_CONFIRMABLE: "Este movimiento no admite confirmación por animal.",
  MOVEMENT_CANCELLED: "Este movimiento ya fue cancelado.",
  INVALID_STATUS_TRANSITION: "Ese cambio de estado no es válido.",
  MOVEMENT_ALREADY_CONFIRMED: "Este movimiento ya está confirmado — no se puede cancelar.",
  NOTES_REQUIRED_FOR_OTHER: "Contá el motivo en notas cuando elegís \"Otro\".",
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
