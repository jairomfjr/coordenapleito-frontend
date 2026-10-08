import type { PageLoadingVariant } from './types';

const DASHBOARD_ROUTES = [
  '/dashboard',
  '/dashboard-projetos',
  '/dashboard-programas-sociais',
  '/relatorios',
];

const MAP_ROUTES = [
  '/mapa-social',
  '/mapa-tour',
  '/mapas/publico',
  '/dashboard/mapas',
];

const LIST_ROUTE_PREFIXES = [
  '/usuarios',
  '/equipamentos',
  '/equipamento-servicos',
  '/cidadaos',
  '/acolhimentos',
  '/demandas-municipio',
  '/mensagens',
  '/acoes',
  '/servicos-vapt-vupt',
  '/orgao-vapt-vupt',
  '/vale-gas',
  '/secofi',
  '/cmic',
  '/ceara-sem-fome',
  '/autoridades',
  '/cargos',
  '/partidos-politicos',
  '/tipos-equipamento',
  '/tipos-servico',
  '/tipos-acolhimento',
  '/servicos',
  '/servicos-caminhao',
  '/coordenacoes',
  '/periodos',
  '/periodos-acoes',
  '/categorias',
  '/etnias',
  '/generos',
  '/orientacoes-sexuais',
  '/grupos',
  '/permissoes',
  '/coordenacao-basica',
  '/inclusao-social',
];

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function resolvePageLoadingVariant(pathname: string): PageLoadingVariant {
  if (pathname === '/login' || pathname.startsWith('/login/')) return 'minimal';
  if (pathname === '/recuperar-senha' || pathname.startsWith('/recuperar-senha/')) return 'minimal';

  if (pathname === '/organograma' || pathname.startsWith('/organograma/')) return 'organogram';

  if (pathname === '/projetos/vapt-vupt' || pathname.startsWith('/projetos/vapt-vupt/')) {
    return 'vapt-list';
  }

  if (
    pathname === '/projetos/casa-cidadao' ||
    pathname.startsWith('/projetos/casa-cidadao/') ||
    pathname === '/projetos/caminhao-cidadao' ||
    pathname.startsWith('/projetos/caminhao-cidadao/')
  ) {
    return 'list';
  }

  if (pathname === '/dashboard/mapas') return 'list';
  if (MAP_ROUTES.some((p) => matchesPrefix(pathname, p))) return 'map';
  if (DASHBOARD_ROUTES.some((p) => matchesPrefix(pathname, p))) return 'dashboard';

  if (LIST_ROUTE_PREFIXES.some((p) => matchesPrefix(pathname, p))) return 'list';

  return 'default';
}
