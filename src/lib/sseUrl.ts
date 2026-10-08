import { resolveApiBaseURLForClient } from '@/lib/apiBaseUrl';

/** URL do stream SSE sem credenciais na query (use {@link subscribeAuthenticatedSse}). */
export function buildSseUrl(path: string): string {
  const base = resolveApiBaseURLForClient().replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

/**
 * @deprecated Use {@link subscribeAuthenticatedSse} — não coloque JWT na URL.
 */
export function buildAuthenticatedSseUrl(path: string): string {
  return buildSseUrl(path);
}
