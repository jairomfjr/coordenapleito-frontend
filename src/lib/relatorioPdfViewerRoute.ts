import { stripAppBasePath } from '@/lib/public-routes';

/** Rota do visualizador PDF (sem sidebar/header do Coordenapleito — igual aba do Chrome). */
export function isRelatorioPdfViewerRoute(pathname: string | null | undefined): boolean {
  if (pathname == null || pathname === '') {
    return false;
  }
  return stripAppBasePath(pathname) === '/relatorios/visualizador-pdf';
}
