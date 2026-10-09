import { getAppBasePath } from '@/lib/app-base-path';

/** Rotas do Next acessíveis sem login (path sem basePath). */
export const PUBLIC_ROUTE_PREFIXES = [
  '/login',
  '/recuperar-senha',
  '/cadastro-coordenador',
  '/mapas/publico',
] as const;

/** Remove o prefixo do Next (`NEXT_PUBLIC_BASE_PATH`) do pathname. */
export function stripAppBasePath(pathname: string | null | undefined): string {
  if (!pathname) return '/';
  const base = getAppBasePath();
  if (!base) return pathname;
  if (pathname === base) return '/';
  if (pathname.startsWith(`${base}/`)) {
    return pathname.slice(base.length) || '/';
  }
  return pathname;
}

/** Indica se a rota atual é pública (catálogo/mapa publicado, login, recuperar senha). */
export function isPublicAppRoute(pathname: string | null | undefined): boolean {
  if (pathname == null || pathname === '') return false;
  const path = stripAppBasePath(pathname);
  return PUBLIC_ROUTE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

/** Detecta catálogo e mapas publicados mesmo com pathname completo (window.location). */
export function isMapasPublicoAppRoute(pathname: string | null | undefined): boolean {
  if (pathname == null || pathname === '') return false;
  const path = stripAppBasePath(pathname);
  return path === '/mapas/publico' || path.startsWith('/mapas/publico/');
}
