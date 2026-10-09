/** Caminho da API atrás do proxy (Nginx / Next rewrites). */
export const API_PATH = '/coordenapleito-api';

/** Host de produção (fallback em SSR sem `window`). */
const PRODUCTION_ORIGIN = 'https://coordenapleito.sps.ce.gov.br';

function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

function envApiUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw || raw.trim() === '') return undefined;
  return trimTrailingSlash(raw.trim());
}

/**
 * Base URL da API.
 *
 * **No browser:** sempre `origem atual + /coordenapleito-api` (proxy Next ou Nginx).
 * Nunca `localhost:8080` no cliente — isso gera 401 sem Bearer confiável.
 *
 * **No SSR:** `NEXT_PUBLIC_API_URL` ou origem de produção.
 */
export function getApiBaseURL(): string {
  if (typeof window !== 'undefined') {
    return `${trimTrailingSlash(window.location.origin)}${API_PATH}`;
  }

  const fromEnv = envApiUrl();
  if (fromEnv) {
    return fromEnv;
  }
  return `${PRODUCTION_ORIGIN}${API_PATH}`;
}

/** Corrige base URL se algo ainda apontar para :8080 (cache/build antigo). */
export function resolveApiBaseURLForClient(): string {
  const base = getApiBaseURL();
  if (typeof window === 'undefined') {
    return base;
  }
  if (base.includes('://localhost:8080') || base.includes('://127.0.0.1:8080')) {
    return `${trimTrailingSlash(window.location.origin)}${API_PATH}`;
  }
  return base;
}

/** Mesma origem do REST; SSE autentica via header Authorization. */
export function getSseApiBaseURL(): string {
  if (process.env.NEXT_PUBLIC_SSE_URL) {
    return trimTrailingSlash(process.env.NEXT_PUBLIC_SSE_URL);
  }
  return resolveApiBaseURLForClient();
}

/**
 * Base WebSocket. O Route Handler do Next não faz upgrade de WS:
 * em localhost aponta direto para a API (:8080); em produção usa a mesma origem (Nginx).
 */
export function getWsApiBaseURL(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WS_URL;
  if (fromEnv && fromEnv.trim() !== '') {
    return trimTrailingSlash(fromEnv.trim());
  }
  if (typeof window === 'undefined') {
    return '';
  }
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${host}:8080${API_PATH}`;
  }
  return resolveApiBaseURLForClient().replace(/^http/, 'ws');
}
