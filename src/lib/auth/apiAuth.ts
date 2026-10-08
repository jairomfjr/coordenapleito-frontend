import { resolveApiBaseURLForClient } from '@/lib/apiBaseUrl';
import { extractAccessToken } from '@/lib/accessToken';
import type { AuthenticationModel } from '@/types/api';
import { withMergedRoles } from '@/lib/authRoles';

/** Login: Basic auth, resposta JSON com accessToken (sem cookie). */
export async function loginWithPassword(
  username: string,
  password: string
): Promise<AuthenticationModel> {
  const base = resolveApiBaseURLForClient().replace(/\/$/, '');
  const basic = btoa(`${username}:${password}`);
  const response = await fetch(`${base}/auth/authenticate`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${basic}`,
    },
    body: '{}',
    credentials: 'omit',
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw Object.assign(new Error('Usuário ou senha inválidos.'), { status: 401 });
    }
    throw new Error(`Login falhou (${response.status})`);
  }

  const data = (await response.json()) as AuthenticationModel & { access_token?: string };
  const token = extractAccessToken(data);
  if (!token) {
    throw new Error('Resposta de login sem accessToken.');
  }
  return withMergedRoles({ ...data, accessToken: token });
}

/** Valida/atualiza sessão (endpoint público; corpo form, sem header Bearer). */
export async function refreshSessionFromToken(
  accessToken: string
): Promise<AuthenticationModel> {
  const token = accessToken.trim();
  const base = resolveApiBaseURLForClient().replace(/\/$/, '');
  const response = await fetch(`${base}/auth/check_token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ token }),
    credentials: 'omit',
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Sessão inválida (${response.status})`);
  }

  const data = (await response.json()) as AuthenticationModel;
  const refreshed = extractAccessToken(data) ?? token;
  return withMergedRoles({ ...data, accessToken: refreshed });
}
