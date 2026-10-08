'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { extractAccessToken } from '@/lib/accessToken';
import {
  api,
  clearStoredAuth,
  getAccessToken,
  loginWithPassword,
  refreshSessionFromToken,
  setAccessToken,
  setStoredUser,
} from '@/lib/auth';
import { routerPath } from '@/lib/app-path';
import { isMapasPublicoAppRoute, isPublicAppRoute } from '@/lib/public-routes';
import { rotaInicialParaUsuario } from '@/lib/routePermissions';
import type { AuthenticationModel } from '@/types/api';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

function isPublicPath(pathname: string | null | undefined): boolean {
  if (isPublicAppRoute(pathname) || isMapasPublicoAppRoute(pathname)) {
    return true;
  }
  if (typeof window === 'undefined') {
    return false;
  }
  const full = window.location.pathname;
  return isPublicAppRoute(full) || isMapasPublicoAppRoute(full);
}

interface AuthContextValue {
  user: AuthenticationModel | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Recarrega permissões do usuário a partir do token (ex.: após editar o próprio grupo). */
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applySession(
  setUser: (u: AuthenticationModel | null) => void,
  setToken: (t: string | null) => void,
  model: AuthenticationModel
): string {
  const accessToken = extractAccessToken(model);
  if (!accessToken) {
    throw new Error('Resposta sem accessToken');
  }
  setAccessToken(accessToken);
  setToken(accessToken);
  setUser(model);
  setStoredUser(model);
  return accessToken;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthenticationModel | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const bootstrappedRef = useRef(false);

  const bootstrap = useCallback(async () => {
    const existing = getAccessToken();
    if (!existing) {
      setUser(null);
      setToken(null);
      setStatus('anonymous');
      return;
    }

    setToken(existing);
    try {
      const model = await refreshSessionFromToken(existing);
      applySession(setUser, setToken, model);
      setStatus('authenticated');
    } catch {
      clearStoredAuth();
      setUser(null);
      setToken(null);
      setStatus('anonymous');
    }
  }, []);

  useEffect(() => {
    if (bootstrappedRef.current) {
      return;
    }
    bootstrappedRef.current = true;
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const onLogout = () => {
      clearStoredAuth();
      setUser(null);
      setToken(null);
      setStatus('anonymous');
      if (isPublicPath(pathname)) {
        return;
      }
      router.replace(routerPath('/login'));
    };
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, [pathname, router]);

  const login = useCallback(
    async (username: string, password: string) => {
      clearStoredAuth();
      const model = await loginWithPassword(username, password);
      applySession(setUser, setToken, model);
      setStatus('authenticated');
      router.replace(routerPath(rotaInicialParaUsuario(model)));
    },
    [router]
  );

  const refreshSession = useCallback(async () => {
    const existing = getAccessToken();
    if (!existing) return;
    const model = await refreshSessionFromToken(existing);
    applySession(setUser, setToken, model);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* estado local sempre limpo */
    }
    clearStoredAuth();
    setUser(null);
    setToken(null);
    setStatus('anonymous');
    router.replace(routerPath('/login'));
  }, [router]);

  const loading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && user != null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshSession,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
}
