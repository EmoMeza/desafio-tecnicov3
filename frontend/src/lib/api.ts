import type { ApiErrorBody, LoginResponse, ScoreResponse } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** Error normalizado de la API: preserva el `status` HTTP y el `code` de negocio. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

let unauthorizedHandler: (() => void) | null = null;

/**
 * Registra un callback global que se dispara cuando una petición **autenticada**
 * recibe 401 (token expirado o inválido). Lo usa la sesión para cerrar sesión.
 */
export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler;
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  token?: string | null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const hasBody = options.body !== undefined;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'No se pudo conectar con el servidor');
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && options.token) {
      unauthorizedHandler?.();
    }
    const error = (payload as ApiErrorBody | null)?.error;
    throw new ApiError(
      response.status,
      error?.code ?? 'UNKNOWN',
      error?.message ?? 'Ocurrió un error inesperado',
    );
  }

  return payload as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/login', { method: 'POST', body: { email, password } }),

  score: (rut: string, token: string) =>
    request<ScoreResponse>(`/score/${encodeURIComponent(rut)}`, { token }),
};
