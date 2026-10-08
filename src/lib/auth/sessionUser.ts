import type { AuthenticationModel } from '@/types/api';

const USER_KEY = 'coordenapleito_user';

export function getStoredUser(): AuthenticationModel | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthenticationModel;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthenticationModel | null): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
  localStorage.removeItem('equipamento_user');
}
