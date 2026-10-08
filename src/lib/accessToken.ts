import type { AuthenticationModel } from '@/types/api';

/** Lê JWT da resposta da API (camelCase ou snake_case). */
export function extractAccessToken(
  data: Partial<AuthenticationModel> & { access_token?: string }
): string | null {
  const raw = data.accessToken ?? data.access_token;
  if (typeof raw !== 'string') {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}
