const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errorCode?: string;

  constructor(statusCode: number, message: string, errorCode?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

function extractMessage(body: unknown): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message: unknown }).message;
    if (Array.isArray(message)) return String(message[0] ?? "Error desconocido");
    if (typeof message === "string") return message;
  }
  return "Error desconocido";
}

function extractErrorCode(body: unknown): string | undefined {
  if (body && typeof body === "object" && "error" in body) {
    const code = (body as { error: unknown }).error;
    if (typeof code === "string") return code;
  }
  return undefined;
}

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  accessToken?: string | null;
};

/**
 * Wrapper delgado sobre fetch: arma la URL contra VITE_API_BASE_URL, serializa el
 * body, inyecta el Bearer token si se pasa, y normaliza errores del backend
 * ({ message, error, statusCode }) en un ApiError tipado en vez de dejar que el
 * caller tenga que parsear la respuesta a mano en cada lugar.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, accessToken, headers, ...rest } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const parsed = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(res.status, extractMessage(parsed), extractErrorCode(parsed));
  }

  return parsed as T;
}
