import { getAppBasePath } from '@/lib/app-base-path';

/**
 * Path para `router.push` / `router.replace` do Next.js.
 * Com `basePath` configurado, o Next adiciona o prefixo automaticamente — não duplicar aqui.
 */
export function routerPath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Path completo para `window.location.assign` (inclui `NEXT_PUBLIC_BASE_PATH` quando existir).
 */
export function locationHref(path: string): string {
  const normalized = routerPath(path);
  const base = getAppBasePath();
  if (!base) return normalized;
  if (normalized === '/') return base;
  return `${base}${normalized}`;
}

/** @deprecated Preferir {@link routerPath} (Next) ou {@link locationHref} (window). */
export function appPath(path: string): string {
  return locationHref(path);
}
