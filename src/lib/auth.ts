import { createApiClient } from './api';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/auth/accessToken';
import { getStoredUser, setStoredUser } from '@/lib/auth/sessionUser';

export { getAccessToken, setAccessToken, clearAccessToken } from '@/lib/auth/accessToken';
export { getStoredUser, setStoredUser } from '@/lib/auth/sessionUser';
export { loginWithPassword, refreshSessionFromToken } from '@/lib/auth/apiAuth';

const EQUIPMENT_CONTEXT_KEY = 'coordenapleito_equipment_context';

export function getSessionBearerToken(): string | null {
  return getAccessToken();
}

export function setSessionBearerToken(token: string | null): void {
  setAccessToken(token);
}

/** Tenta expirar cookie não-HttpOnly; HttpOnly depende do Set-Cookie do /auth/logout. */
function clearAccessTokenCookieBestEffort(): void {
  if (typeof document === 'undefined') return;
  const expire = 'Thu, 01 Jan 1970 00:00:00 GMT';
  for (const path of ['/', '/coordenapleito-api']) {
    document.cookie = `access_token=; Path=${path}; Expires=${expire}; Max-Age=0; SameSite=Lax`;
  }
}

export function clearStoredAuth(): void {
  clearAccessToken();
  setStoredUser(null);
  clearAccessTokenCookieBestEffort();
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(EQUIPMENT_CONTEXT_KEY);
    localStorage.removeItem('equipamento_user');
    localStorage.removeItem('coordenapleito_jwt');
    localStorage.removeItem('coordenapleito_session_bearer');
    localStorage.removeItem('equipamento_token');
  }
}

export function setStoredAuth(_accessToken: string | null, user: unknown): void {
  setStoredUser(user as import('@/types/api').AuthenticationModel);
}

export function getEquipmentContextId(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(EQUIPMENT_CONTEXT_KEY);
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as { id?: number };
    return o?.id != null ? String(o.id) : null;
  } catch {
    return null;
  }
}

export function setEquipmentContext(
  equipamento: { id: number; codigo: string; nome: string } | null
): void {
  if (typeof window === 'undefined') return;
  if (equipamento) {
    sessionStorage.setItem(EQUIPMENT_CONTEXT_KEY, JSON.stringify(equipamento));
  } else {
    sessionStorage.removeItem(EQUIPMENT_CONTEXT_KEY);
  }
}

export function getEquipmentContext(): {
  id: number;
  codigo: string;
  nome: string;
} | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(EQUIPMENT_CONTEXT_KEY);
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as { id?: number; codigo?: string; nome?: string };
    return o?.id != null && o?.codigo != null && o?.nome != null
      ? { id: o.id, codigo: o.codigo, nome: o.nome }
      : null;
  } catch {
    return null;
  }
}

export const api = createApiClient(getAccessToken, getEquipmentContextId);
