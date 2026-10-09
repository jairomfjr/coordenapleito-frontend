/**
 * Controle de acesso a rotas por permissões funcionais ({@code recurso.pagina} ou {@code recurso.menu}).
 */
import type { AuthenticationModel } from '@/types/api';
import { mergeRolesFromApiUser } from '@/lib/authRoles';
import {
  hasAnyPermission,
  hasPermission,
  obterPerfilProjetoExclusivo,
  pathnamePermitidoPerfilProjetoExclusivo,
  usuarioPodeAcessarPaginaDashboardProjetos,
  usuarioPodeAcessarPaginaInicio,
  usuarioPodeAcessarPaginaProjeto,
  usuarioPodeAcessarPaginaRecurso,
  usuarioPodeAcessarRelatorioCidadaos,
  usuarioPodeAcessarRelatorioCasaCidadao,
  usuarioPodeAcessarRelatorioCaminhaoCidadao,
  usuarioPodeAcessarRelatorioDashboards,
  usuarioPodeAcessarRelatorios,
} from '@/lib/permissions';
import {
  chaveModuloParaPathname,
  usuarioPodeAcessarPaginaModuloOperacional,
} from '@/lib/modulosOperacionais';

/** Perfis que entram na home (organograma), não só módulo de projeto. */
const PERFIS_ROTA_HOME = new Set([
  'Analista',
  'Administrador',
  'Secretário',
  'Secretario',
  'Coordenador',
  'Supervisor',
  'Técnico',
  'Gestão SPS',
]);

export const MENSAGEM_SEM_PERMISSAO_PAGINA =
  'Você não tem permissão para acessar esta página.';

type RotaRule = { prefix: string; permission: string };

/** Páginas do menu Dashboard — exigem {@code recurso.pagina}. */
const RECURSOS_PAGINA_DASHBOARD = new Set([
  'dashboard',
  'dashboard-programas-sociais',
  'dashboard-qualificacao',
  'mapa-social',
]);

/** Módulos operacionais de projeto — aceita também {@code *-atendimento.*}. */
const RECURSOS_PAGINA_PROJETO = new Set([
  'vapt-vupt',
  'casa-cidadao',
  'caminhao-cidadao',
  'coordenacao-basica',
  'inclusao-social',
]);

const ROTAS: RotaRule[] = [
  { prefix: '/usuarios', permission: 'usuario.pagina' },
  { prefix: '/grupos', permission: 'grupo.pagina' },
  { prefix: '/locais-votacao', permission: 'local-votacao.pagina' },
  { prefix: '/coordenadores', permission: 'coordenador.pagina' },
  { prefix: '/modulos-operacionais', permission: 'modulo-operacional.pagina' },
  { prefix: '/permissoes', permission: 'permissao.pagina' },
  { prefix: '/mensagens', permission: 'mensagem-admin.pagina' },
  { prefix: '/generos', permission: 'genero.pagina' },
  { prefix: '/etnias', permission: 'etnia.pagina' },
  { prefix: '/orientacoes-sexuais', permission: 'orientacao-sexual.pagina' },
  { prefix: '/acoes', permission: 'acao.pagina' },
  { prefix: '/periodos', permission: 'periodo.pagina' },
  { prefix: '/periodos-acoes', permission: 'periodo-acao.pagina' },
  { prefix: '/tipos-acolhimento', permission: 'tipo-acolhimento.pagina' },
  { prefix: '/tipos-equipamento', permission: 'tipo-equipamento.pagina' },
  { prefix: '/categorias', permission: 'categoria.pagina' },
  { prefix: '/tipos-servico', permission: 'tipo-servico.pagina' },
  { prefix: '/servicos', permission: 'servico.pagina' },
  { prefix: '/servicos-caminhao', permission: 'servico-caminhao.pagina' },
  { prefix: '/servicos-vapt-vupt', permission: 'servico-vapt-vupt.pagina' },
  { prefix: '/orgao-vapt-vupt', permission: 'orgao-vapt-vupt.pagina' },
  { prefix: '/coordenacoes', permission: 'coordenacao.pagina' },
  { prefix: '/cargos', permission: 'cargo.pagina' },
  { prefix: '/partidos-politicos', permission: 'partido-politico.pagina' },
  { prefix: '/cidadaos', permission: 'cidadao.pagina' },
  { prefix: '/equipamentos', permission: 'equipamento.pagina' },
  { prefix: '/equipamento-servicos', permission: 'equipamento-servico.pagina' },
  { prefix: '/acolhimentos', permission: 'acolhimento.pagina' },
  { prefix: '/autoridades', permission: 'autoridade.pagina' },
  { prefix: '/demandas-municipio', permission: 'demanda-municipio.pagina' },
  { prefix: '/organograma', permission: 'organograma.pagina' },
  { prefix: '/coordenacao-basica', permission: 'coordenacao-basica.pagina' },
  { prefix: '/inclusao-social', permission: 'inclusao-social.pagina' },
  { prefix: '/dashboard-projetos', permission: 'dashboard-projetos.pagina' },
  { prefix: '/dashboard/qualificacao', permission: 'dashboard-qualificacao.pagina' },
  { prefix: '/dashboard-programas-sociais', permission: 'dashboard-programas-sociais.pagina' },
  { prefix: '/dashboard', permission: 'dashboard.pagina' },
  { prefix: '/mapa-social', permission: 'mapa-social.pagina' },
  { prefix: '/mapa-tour', permission: 'dashboard.pagina' },
  { prefix: '/dashboard/mapas', permission: 'mapa-interativo.pagina' },
  { prefix: '/cmic', permission: 'cmic.pagina' },
  { prefix: '/ceara-sem-fome', permission: 'ceara-sem-fome.pagina' },
  { prefix: '/vale-gas', permission: 'vale-gas.pagina' },
  { prefix: '/secofi', permission: 'secofi.pagina' },
  { prefix: '/projetos/vapt-vupt', permission: 'vapt-vupt.pagina' },
  { prefix: '/projetos/casa-cidadao', permission: 'casa-cidadao.pagina' },
  { prefix: '/projetos/caminhao-cidadao', permission: 'caminhao-cidadao.pagina' },
  { prefix: '/relatorios/cidadaos', permission: 'relatorio-cidadao.pagina' },
  { prefix: '/relatorios/casa-cidadao', permission: 'relatorio-casa-cidadao.pagina' },
  { prefix: '/relatorios/caminhao-cidadao', permission: 'relatorio-caminhao-cidadao.pagina' },
  { prefix: '/relatorios/dashboards', permission: 'relatorio-dashboard.pagina' },
  { prefix: '/relatorios', permission: 'relatorio.pagina' },
].sort((a, b) => b.prefix.length - a.prefix.length);

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function permissaoPaginaAtendida(
  user: AuthenticationModel | null | undefined,
  permission: string
): boolean {
  if (permission.endsWith('.pagina')) {
    const recurso = permission.slice(0, -'.pagina'.length);
    if (recurso === 'relatorio') {
      return usuarioPodeAcessarRelatorios(user);
    }
    if (recurso === 'relatorio-cidadao') {
      return usuarioPodeAcessarRelatorioCidadaos(user);
    }
    if (recurso === 'relatorio-casa-cidadao') {
      return usuarioPodeAcessarRelatorioCasaCidadao(user);
    }
    if (recurso === 'relatorio-caminhao-cidadao') {
      return usuarioPodeAcessarRelatorioCaminhaoCidadao(user);
    }
    if (recurso === 'relatorio-dashboard') {
      return usuarioPodeAcessarRelatorioDashboards(user);
    }
    if (RECURSOS_PAGINA_DASHBOARD.has(recurso)) {
      return usuarioPodeAcessarPaginaRecurso(user, recurso);
    }
    if (RECURSOS_PAGINA_PROJETO.has(recurso)) {
      return usuarioPodeAcessarPaginaProjeto(user, recurso);
    }
  }
  return hasPermission(user, permission);
}

export function rotaNegadaParaUsuario(
  pathname: string,
  user: AuthenticationModel | null | undefined
): boolean {
  if (pathname === '/mapas/publico' || pathname.startsWith('/mapas/publico/')) {
    return false;
  }

  if (pathname === '/' || pathname === '') {
    return !usuarioPodeAcessarPaginaInicio(user);
  }

  const perfilExclusivo = obterPerfilProjetoExclusivo(user);
  if (perfilExclusivo && pathnamePermitidoPerfilProjetoExclusivo(perfilExclusivo, pathname)) {
    return false;
  }

  if (pathMatchesPrefix(pathname, '/dashboard-projetos')) {
    return !usuarioPodeAcessarPaginaDashboardProjetos(user);
  }
  for (const rule of ROTAS) {
    if (!pathMatchesPrefix(pathname, rule.prefix)) continue;
    if (!permissaoPaginaAtendida(user, rule.permission)) {
      return true;
    }
    const chaveModulo = chaveModuloParaPathname(pathname);
    if (chaveModulo && !usuarioPodeAcessarPaginaModuloOperacional(user, chaveModulo, rule.permission)) {
      return true;
    }
    return false;
  }

  return perfilExclusivo != null;
}

export function rotaInicialParaUsuario(user: AuthenticationModel | null | undefined): string {
  if (usuarioPodeAcessarPaginaInicio(user)) {
    return '/';
  }

  const perfilExclusivo = obterPerfilProjetoExclusivo(user);
  if (perfilExclusivo === 'casa-cidadao') {
    return '/projetos/casa-cidadao';
  }
  if (perfilExclusivo === 'caminhao') {
    return '/projetos/caminhao-cidadao';
  }

  const roles = mergeRolesFromApiUser(user);
  if (roles.some((r) => PERFIS_ROTA_HOME.has(r))) {
    return '/';
  }
  if (
    hasAnyPermission(user, [
      'usuario.menu',
      'usuario.pagina',
      'equipamento.menu',
      'equipamento.pagina',
      'grupo.menu',
    ])
  ) {
    return '/';
  }
  if (
    usuarioPodeAcessarPaginaModuloOperacional(user, 'casa-cidadao', 'casa-cidadao.pagina') &&
    !hasPermission(user, 'equipamento.pagina') &&
    !hasPermission(user, 'equipamento.menu')
  ) {
    return '/projetos/casa-cidadao';
  }
  if (
    usuarioPodeAcessarPaginaModuloOperacional(user, 'caminhao-cidadao', 'caminhao-cidadao.pagina') &&
    !hasPermission(user, 'equipamento.pagina') &&
    !hasPermission(user, 'equipamento.menu')
  ) {
    return '/projetos/caminhao-cidadao';
  }
  return '/';
}

export { usuarioPodeAcessarMapasInterativos } from '@/lib/permissions';
