/**
 * Token JWT da sessão SPA — memória + sessionStorage (síncrono para interceptors axios).
 */
const STORAGE_KEY = 'coordenapleito_access_token';

let memoryToken: string | null = null;

export function getAccessToken(): string | null {
  if (memoryToken) {
    return memoryToken;
  }
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = sessionStorage.getItem(STORAGE_KEY);
  memoryToken = raw?.trim() ? raw.trim() : null;
  return memoryToken;
}

export function setAccessToken(token: string | null): void {
  memoryToken = token?.trim() ? token.trim() : null;
  if (typeof window === 'undefined') {
    return;
  }
  if (memoryToken) {
    sessionStorage.setItem(STORAGE_KEY, memoryToken);
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
  localStorage.removeItem('coordenapleito_jwt');
  localStorage.removeItem('coordenapleito_session_bearer');
  localStorage.removeItem('equipamento_token');
}

export function clearAccessToken(): void {
  setAccessToken(null);
}
