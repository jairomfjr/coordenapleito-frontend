import type { AuthenticationModel } from '@/types/api';
import { mergeRolesFromApiUser } from '@/lib/authRoles';
import {
  usuarioPodeAcessarModuloOperacional,
  usuarioPodeVerMenuModuloOperacional,
  usuarioTemModuloOperacional,
  usuarioTemVisaoGeralDeEquipamentos,
} from '@/lib/modulosOperacionais';

/** Grupos de projeto com menu restrito a um único módulo. */
export const ROLE_TECNICO_CASA_CIDADAO = 'Técnico Casa Cidadão';
export const ROLE_TECNICO_CAMINHAO = 'Técnico Caminhão';

export type PerfilProjetoExclusivo = 'casa-cidadao' | 'caminhao';

const PERFIS_ACESSO_AMPLIO_MENU = [
  'Analista',
  'Administrador',
  'Secretário',
  'Secretario',
  'Gestão SPS',
  'Coordenador',
  'Supervisor',
  'Técnico',
] as const;

const CHAVES_RECURSO_PROJETO_EXCLUSIVO = ['caminhao-cidadao', 'casa-cidadao'] as const;

function normalizarNomeGrupo(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .toLowerCase();
}

function roleEhTecnicoCaminhao(role: string): boolean {
  const n = normalizarNomeGrupo(role);
  return n === 'tecnico caminhao' || n.includes('tecnico caminhao');
}

function roleEhTecnicoCasaCidadao(role: string): boolean {
  const n = normalizarNomeGrupo(role);
  return n === 'tecnico casa cidadao' || n.includes('tecnico casa cidadao');
}

function usuarioTemPerfilAmploMenu(roles: string[]): boolean {
  const amplios = new Set(PERFIS_ACESSO_AMPLIO_MENU.map(normalizarNomeGrupo));
  return roles.some((r) => amplios.has(normalizarNomeGrupo(r)));
}

function chavesNavegacaoRecurso(recurso: string): string[] {
  return [`${recurso}.menu`, `${recurso}.pagina`];
}

function usuarioTemPermissaoAcessoRecursoProjeto(
  user: AuthenticationModel | null | undefined,
  recurso: (typeof CHAVES_RECURSO_PROJETO_EXCLUSIVO)[number]
): boolean {
  if (hasAnyPermission(user, chavesNavegacaoRecurso(recurso))) {
    return true;
  }
  const atendimento =
    recurso === 'caminhao-cidadao' ? 'caminhao-cidadao-atendimento' : 'casa-cidadao-atendimento';
  return hasAnyPermission(user, chavesNavegacaoRecurso(atendimento));
}

function detectarPerfilProjetoExclusivoPorGrupo(roles: string[]): PerfilProjetoExclusivo | null {
  const casa = roles.some(roleEhTecnicoCasaCidadao);
  const caminhao = roles.some(roleEhTecnicoCaminhao);
  if (casa && !caminhao) return 'casa-cidadao';
  if (caminhao && !casa) return 'caminhao';
  if (casa && caminhao) return 'casa-cidadao';
  return null;
}

function detectarPerfilProjetoExclusivoPorPermissoes(
  user: AuthenticationModel | null | undefined
): PerfilProjetoExclusivo | null {
  const comAcesso = CHAVES_RECURSO_PROJETO_EXCLUSIVO.filter((recurso) =>
    usuarioTemPermissaoAcessoRecursoProjeto(user, recurso)
  );
  if (comAcesso.length !== 1) return null;
  return comAcesso[0] === 'caminhao-cidadao' ? 'caminhao' : 'casa-cidadao';
}

const HREF_MENU_PERFIL_PROJETO_EXCLUSIVO: Record<PerfilProjetoExclusivo, string> = {
  'casa-cidadao': '/projetos/casa-cidadao',
  caminhao: '/projetos/caminhao-cidadao',
};

const PREFIXOS_ROTA_PERFIL_PROJETO_EXCLUSIVO: Record<PerfilProjetoExclusivo, string[]> = {
  'casa-cidadao': ['/projetos/casa-cidadao'],
  caminhao: ['/projetos/caminhao-cidadao'],
};

/** Rotas auxiliares (sem item de menu) para perfis restritos. */
const PREFIXOS_AUX_PERFIL_PROJETO_EXCLUSIVO = ['/relatorios/visualizador-pdf'];

const PERMISSOES_INICIO_MENU = ['inicio.menu'] as const;
const PERMISSOES_INICIO_PAGINA = ['inicio.pagina'] as const;

/** Item Início no menu lateral. */
export function usuarioPodeVerMenuInicio(
  user: AuthenticationModel | null | undefined
): boolean {
  return hasAnyPermission(user, [...PERMISSOES_INICIO_MENU]);
}

/** Página inicial ({@code /}). */
export function usuarioPodeAcessarPaginaInicio(
  user: AuthenticationModel | null | undefined
): boolean {
  return hasAnyPermission(user, [...PERMISSOES_INICIO_PAGINA]);
}

/** @deprecated Use {@link usuarioPodeVerMenuInicio} ou {@link usuarioPodeAcessarPaginaInicio}. */
export function usuarioPodeAcessarInicio(
  user: AuthenticationModel | null | undefined
): boolean {
  return usuarioPodeVerMenuInicio(user) || usuarioPodeAcessarPaginaInicio(user);
}

/** Exibe item no menu lateral ({@code recurso.menu}). */
export function usuarioPodeVerMenuRecurso(
  user: AuthenticationModel | null | undefined,
  recurso: string
): boolean {
  return hasPermission(user, `${recurso}.menu`);
}

/** Acessa a tela do recurso ({@code recurso.pagina}). */
export function usuarioPodeAcessarPaginaRecurso(
  user: AuthenticationModel | null | undefined,
  recurso: string
): boolean {
  return hasPermission(user, `${recurso}.pagina`);
}

/** Lista registros via API ({@code recurso.listar}) — comboboxes e consumo auxiliar. */
export function usuarioPodeListarRecurso(
  user: AuthenticationModel | null | undefined,
  recurso: string
): boolean {
  return hasPermission(user, `${recurso}.listar`);
}

/** Visualiza detalhe de registro ({@code recurso.visualizar}). */
export function usuarioPodeVisualizarRecurso(
  user: AuthenticationModel | null | undefined,
  recurso: string
): boolean {
  return hasPermission(user, `${recurso}.visualizar`);
}

export const PERMISSAO_LOCAL_VOTACAO_BLOQUEAR_CAMPOS = 'local-votacao.bloquear-campos';

/** Grupo com bloqueio sinalizado: só Coordenadores permanece editável. */
export function usuarioTemBloqueioCamposLocalVotacao(
  user: AuthenticationModel | null | undefined
): boolean {
  return hasPermission(user, PERMISSAO_LOCAL_VOTACAO_BLOQUEAR_CAMPOS);
}

/**
 * Técnico Casa Cidadão ou Técnico Caminhão sem perfil administrativo/operacional amplo.
 */
export function obterPerfilProjetoExclusivo(
  user: AuthenticationModel | null | undefined
): PerfilProjetoExclusivo | null {
  const roles = mergeRolesFromApiUser(user);
  if (!roles.length) return null;
  if (usuarioTemPerfilAmploMenu(roles)) return null;

  const porGrupo = detectarPerfilProjetoExclusivoPorGrupo(roles);
  if (porGrupo) return porGrupo;

  return detectarPerfilProjetoExclusivoPorPermissoes(user);
}

export function usuarioMenuRestritoProjetoExclusivo(
  user: AuthenticationModel | null | undefined
): boolean {
  return obterPerfilProjetoExclusivo(user) != null;
}

export function hrefMenuPerfilProjetoExclusivo(perfil: PerfilProjetoExclusivo): string {
  return HREF_MENU_PERFIL_PROJETO_EXCLUSIVO[perfil];
}

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function pathnamePermitidoPerfilProjetoExclusivo(
  perfil: PerfilProjetoExclusivo,
  pathname: string
): boolean {
  const prefixes = [
    ...PREFIXOS_ROTA_PERFIL_PROJETO_EXCLUSIVO[perfil],
    ...PREFIXOS_AUX_PERFIL_PROJETO_EXCLUSIVO,
  ];
  return prefixes.some((p) => pathMatchesPrefix(pathname, p));
}

/** Permissões funcionais do usuário ({@code recurso.acao}). */
export function getUserPermissoes(user: AuthenticationModel | null | undefined): string[] {
  if (!user) return [];
  if (user.permissoes?.length) return user.permissoes;
  if (user.authorities?.length) return user.authorities;
  return [];
}

export function hasPermission(
  user: AuthenticationModel | null | undefined,
  permission: string
): boolean {
  if (!permission) return false;
  return getUserPermissoes(user).includes(permission);
}

export function hasAnyPermission(
  user: AuthenticationModel | null | undefined,
  permissions: string[]
): boolean {
  if (!permissions.length) return false;
  const set = new Set(getUserPermissoes(user));
  return permissions.some((p) => set.has(p));
}

/** Recurso de atendimento → recurso do módulo operacional (ex.: caminhao-cidadao). */
const RECURSO_MODULO_PAI: Record<string, string> = {
  'caminhao-cidadao-atendimento': 'caminhao-cidadao',
  'casa-cidadao-atendimento': 'casa-cidadao',
  'vapt-vupt-atendimento': 'vapt-vupt',
};

/**
 * Aceita permissão no recurso de atendimento ou no módulo pai (ex.: {@code caminhao-cidadao.pagina}
 * habilita listagem de {@code caminhao-cidadao-atendimento}).
 */
export function hasPermissionRecursoProjeto(
  user: AuthenticationModel | null | undefined,
  recurso: string,
  acao: string
): boolean {
  if (hasPermission(user, `${recurso}.${acao}`)) return true;
  const pai = RECURSO_MODULO_PAI[recurso];
  return pai ? hasPermission(user, `${pai}.${acao}`) : false;
}

export function hasAllPermissions(
  user: AuthenticationModel | null | undefined,
  permissions: string[]
): boolean {
  if (!permissions.length) return false;
  const set = new Set(getUserPermissoes(user));
  return permissions.every((p) => set.has(p));
}

/** Mapeamento rota do menu → permissão {@code recurso.menu}. */
const HREF_MENU_PERMISSION: Record<string, string> = {
  '/': 'inicio.menu',
  '/usuarios': 'usuario.menu',
  '/grupos': 'grupo.menu',
  '/locais-votacao': 'local-votacao.menu',
  '/coordenadores': 'coordenador.menu',
  '/modulos-operacionais': 'modulo-operacional.menu',
  '/permissoes': 'permissao.menu',
  '/mensagens': 'mensagem-admin.menu',
  '/dashboard/mapas': 'mapa-interativo.menu',
  '/generos': 'genero.menu',
  '/etnias': 'etnia.menu',
  '/orientacoes-sexuais': 'orientacao-sexual.menu',
  '/acoes': 'acao.menu',
  '/periodos': 'periodo.menu',
  '/periodos-acoes': 'periodo-acao.menu',
  '/tipos-acolhimento': 'tipo-acolhimento.menu',
  '/tipos-equipamento': 'tipo-equipamento.menu',
  '/categorias': 'categoria.menu',
  '/tipos-servico': 'tipo-servico.menu',
  '/servicos': 'servico.menu',
  '/servicos-caminhao': 'servico-caminhao.menu',
  '/servicos-vapt-vupt': 'servico-vapt-vupt.menu',
  '/orgao-vapt-vupt': 'orgao-vapt-vupt.menu',
  '/coordenacoes': 'coordenacao.menu',
  '/cargos': 'cargo.menu',
  '/partidos-politicos': 'partido-politico.menu',
  '/cidadaos': 'cidadao.menu',
  '/equipamentos': 'equipamento.menu',
  '/equipamento-servicos': 'equipamento-servico.menu',
  '/acolhimentos': 'acolhimento.menu',
  '/autoridades': 'autoridade.menu',
  '/demandas-municipio': 'demanda-municipio.menu',
  '/organograma': 'organograma.menu',
  '/coordenacao-basica': 'coordenacao-basica.menu',
  '/inclusao-social': 'inclusao-social.menu',
  '/dashboard': 'dashboard.menu',
  '/dashboard-projetos': 'dashboard-projetos.menu',
  '/dashboard/qualificacao': 'dashboard-qualificacao.menu',
  '/dashboard-programas-sociais': 'dashboard-programas-sociais.menu',
  '/mapa-social': 'mapa-social.menu',
  '/mapa-tour': 'dashboard.menu',
  '/cmic': 'cmic.menu',
  '/ceara-sem-fome': 'ceara-sem-fome.menu',
  '/vale-gas': 'vale-gas.menu',
  '/secofi': 'secofi.menu',
  '/projetos/vapt-vupt': 'vapt-vupt.menu',
  '/projetos/casa-cidadao': 'casa-cidadao.menu',
  '/projetos/caminhao-cidadao': 'caminhao-cidadao.menu',
  '/relatorios': 'relatorio.menu',
};

const RELATORIO_CIDADAO_ACESSO = [
  'relatorio-cidadao.menu',
  'relatorio-cidadao.pagina',
  'relatorio-cidadao.listar',
  'relatorio-cidadao.visualizar',
  'relatorio-cidadao.gerar',
  'relatorio.gerar',
] as const;

const RELATORIO_CASA_CIDADAO_ACESSO = [
  'relatorio-casa-cidadao.menu',
  'relatorio-casa-cidadao.pagina',
  'relatorio-casa-cidadao.listar',
  'relatorio-casa-cidadao.visualizar',
  'relatorio-casa-cidadao.gerar-sintetico',
  'relatorio-casa-cidadao.gerar-analitico',
] as const;

const RELATORIO_CAMINHAO_CIDADAO_ACESSO = [
  'relatorio-caminhao-cidadao.menu',
  'relatorio-caminhao-cidadao.pagina',
  'relatorio-caminhao-cidadao.listar',
  'relatorio-caminhao-cidadao.visualizar',
  'relatorio-caminhao-cidadao.gerar-sintetico',
  'relatorio-caminhao-cidadao.gerar-analitico',
] as const;

const RELATORIO_DASHBOARD_ACESSO = [
  'relatorio-dashboard.menu',
  'relatorio-dashboard.pagina',
  'relatorio-dashboard.listar',
  'relatorio-dashboard.visualizar',
  'relatorio-dashboard.gerar-equipamentos',
  'relatorio-dashboard.gerar-vapt-vupt',
  'relatorio-dashboard.gerar-casa-cidadao',
  'relatorio-dashboard.gerar-caminhao-cidadao',
  'relatorio-dashboard.gerar-programas-sociais',
  'relatorio-dashboard.gerar-qualificacao',
  'relatorio-dashboard.gerar-todos',
] as const;

const RELATORIO_DASHBOARD_GERAR = [
  'relatorio-dashboard.gerar-equipamentos',
  'relatorio-dashboard.gerar-vapt-vupt',
  'relatorio-dashboard.gerar-casa-cidadao',
  'relatorio-dashboard.gerar-caminhao-cidadao',
  'relatorio-dashboard.gerar-programas-sociais',
  'relatorio-dashboard.gerar-qualificacao',
  'relatorio-dashboard.gerar-todos',
] as const;

/** Menu da seção Relatórios no sidebar. */
export function usuarioPodeVerMenuSecaoRelatorios(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    hasPermission(user, 'relatorio.menu') ||
    hasPermission(user, 'relatorio-cidadao.menu') ||
    hasPermission(user, 'relatorio-casa-cidadao.menu') ||
    hasPermission(user, 'relatorio-caminhao-cidadao.menu') ||
    hasPermission(user, 'relatorio-dashboard.menu')
  );
}

/** Tela e menu da seção Relatórios. */
export function usuarioPodeAcessarRelatorios(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    usuarioPodeAcessarPaginaRecurso(user, 'relatorio') ||
    usuarioPodeAcessarRelatorioCidadaos(user) ||
    usuarioPodeAcessarRelatorioCasaCidadao(user) ||
    usuarioPodeAcessarRelatorioCaminhaoCidadao(user) ||
    usuarioPodeAcessarRelatorioDashboards(user)
  );
}

/** Acesso ao relatório de cidadãos. */
export function usuarioPodeAcessarRelatorioCidadaos(
  user: AuthenticationModel | null | undefined
): boolean {
  return hasPermission(user, 'relatorio-cidadao.pagina');
}

/** Acesso ao relatório Casa do Cidadão (sintético/analítico). */
export function usuarioPodeAcessarRelatorioCasaCidadao(
  user: AuthenticationModel | null | undefined
): boolean {
  if (!hasPermission(user, 'relatorio-casa-cidadao.pagina')) {
    return false;
  }
  return (
    usuarioPodeVerDashboardCasaCidadao(user) ||
    usuarioPodeAcessarPaginaRecurso(user, 'casa-cidadao-atendimento') ||
    usuarioPodeAcessarPaginaRecurso(user, 'casa-cidadao')
  );
}

/** Geração de PDF sintético — Casa do Cidadão. */
export function usuarioPodeGerarRelatorioCasaCidadaoSintetico(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    hasPermission(user, 'relatorio-casa-cidadao.gerar-sintetico') &&
    usuarioPodeAcessarRelatorioCasaCidadao(user)
  );
}

/** Geração de PDF analítico — Casa do Cidadão. */
export function usuarioPodeGerarRelatorioCasaCidadaoAnalitico(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    hasPermission(user, 'relatorio-casa-cidadao.gerar-analitico') &&
    usuarioPodeAcessarRelatorioCasaCidadao(user)
  );
}

/** Modo normal — relatório analítico Casa do Cidadão. */
export function usuarioPodeModoNormalRelatorioCasaCidadao(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    hasPermission(user, 'relatorio-casa-cidadao.dados-pessoais') ||
    hasPermission(user, 'relatorio.dados-pessoais')
  );
}

/** Modo anonimizado — relatório analítico Casa do Cidadão. */
export function usuarioPodeModoAnonimizadoRelatorioCasaCidadao(
  user: AuthenticationModel | null | undefined
): boolean {
  return hasPermission(user, 'relatorio-casa-cidadao.dados-anonimizados');
}

/** Gera PDF analítico com pelo menos um modo de exibição. */
export function usuarioPodeGerarRelatorioCasaCidadaoAnaliticoComModo(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    usuarioPodeGerarRelatorioCasaCidadaoAnalitico(user) &&
    (usuarioPodeModoNormalRelatorioCasaCidadao(user) ||
      usuarioPodeModoAnonimizadoRelatorioCasaCidadao(user))
  );
}

/** Acesso ao relatório Caminhão do Cidadão (sintético/analítico). */
export function usuarioPodeAcessarRelatorioCaminhaoCidadao(
  user: AuthenticationModel | null | undefined
): boolean {
  if (!hasPermission(user, 'relatorio-caminhao-cidadao.pagina')) {
    return false;
  }
  return (
    usuarioPodeVerDashboardCaminhaoCidadao(user) ||
    usuarioPodeAcessarPaginaRecurso(user, 'caminhao-cidadao-atendimento') ||
    usuarioPodeAcessarPaginaRecurso(user, 'caminhao-cidadao')
  );
}

/** Geração de PDF sintético — Caminhão do Cidadão. */
export function usuarioPodeGerarRelatorioCaminhaoCidadaoSintetico(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    hasPermission(user, 'relatorio-caminhao-cidadao.gerar-sintetico') &&
    usuarioPodeAcessarRelatorioCaminhaoCidadao(user)
  );
}

/** Geração de PDF analítico — Caminhão do Cidadão. */
export function usuarioPodeGerarRelatorioCaminhaoCidadaoAnalitico(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    hasPermission(user, 'relatorio-caminhao-cidadao.gerar-analitico') &&
    usuarioPodeAcessarRelatorioCaminhaoCidadao(user)
  );
}

/** Modo normal — relatório analítico Caminhão do Cidadão. */
export function usuarioPodeModoNormalRelatorioCaminhaoCidadao(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    hasPermission(user, 'relatorio-caminhao-cidadao.dados-pessoais') ||
    hasPermission(user, 'relatorio.dados-pessoais')
  );
}

/** Modo anonimizado — relatório analítico Caminhão do Cidadão. */
export function usuarioPodeModoAnonimizadoRelatorioCaminhaoCidadao(
  user: AuthenticationModel | null | undefined
): boolean {
  return hasPermission(user, 'relatorio-caminhao-cidadao.dados-anonimizados');
}

/** Gera PDF analítico Caminhão do Cidadão com pelo menos um modo de exibição. */
export function usuarioPodeGerarRelatorioCaminhaoCidadaoAnaliticoComModo(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    usuarioPodeGerarRelatorioCaminhaoCidadaoAnalitico(user) &&
    (usuarioPodeModoNormalRelatorioCaminhaoCidadao(user) ||
      usuarioPodeModoAnonimizadoRelatorioCaminhaoCidadao(user))
  );
}

/** Geração de PDF do relatório de cidadãos. */
export function usuarioPodeGerarRelatorioCidadaoPdf(
  user: AuthenticationModel | null | undefined
): boolean {
  return hasPermission(user, 'relatorio-cidadao.gerar') || hasPermission(user, 'relatorio.gerar');
}

/** Modo normal (CPF, nome, telefone e e-mail sem mascaramento) — relatório de cidadãos. */
export function usuarioPodeModoNormalRelatorioCidadao(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    hasPermission(user, 'relatorio-cidadao.dados-pessoais') ||
    hasPermission(user, 'relatorio.dados-pessoais')
  );
}

/** Modo anonimizado — relatório de cidadãos (exige permissão explícita). */
export function usuarioPodeModoAnonimizadoRelatorioCidadao(
  user: AuthenticationModel | null | undefined
): boolean {
  return hasPermission(user, 'relatorio-cidadao.dados-anonimizados');
}

/** Gera PDF com pelo menos um modo de exibição concedido no grupo. */
export function usuarioPodeGerarRelatorioCidadaoComModo(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    usuarioPodeGerarRelatorioCidadaoPdf(user) &&
    (usuarioPodeModoNormalRelatorioCidadao(user) ||
      usuarioPodeModoAnonimizadoRelatorioCidadao(user))
  );
}

/** @deprecated Use {@link usuarioPodeGerarRelatorioCidadaoPdf}. */
export function usuarioPodeGerarRelatorioPdf(
  user: AuthenticationModel | null | undefined
): boolean {
  return usuarioPodeGerarRelatorioCidadaoPdf(user);
}

/** @deprecated Use {@link usuarioPodeModoNormalRelatorioCidadao}. */
export function usuarioPodeExibirDadosPessoaisRelatorio(
  user: AuthenticationModel | null | undefined
): boolean {
  return usuarioPodeModoNormalRelatorioCidadao(user);
}

/** Acesso ao relatório de dashboards. */
export function usuarioPodeAcessarRelatorioDashboards(
  user: AuthenticationModel | null | undefined
): boolean {
  return hasPermission(user, 'relatorio-dashboard.pagina');
}

/** Pelo menos uma opção de geração de PDF de dashboards. */
export function usuarioPodeGerarAlgumRelatorioDashboard(
  user: AuthenticationModel | null | undefined,
  opcoesApi?: { podeGerar: boolean }[]
): boolean {
  if (opcoesApi?.some((o) => o.podeGerar)) {
    return true;
  }
  return hasAnyPermission(user, [...RELATORIO_DASHBOARD_GERAR]);
}

function podeVerMenuHrefComPermissao(
  user: AuthenticationModel | null | undefined,
  href: string
): boolean {
  if (href === '/relatorios') {
    return usuarioPodeVerMenuSecaoRelatorios(user);
  }
  const perm = HREF_MENU_PERMISSION[href];
  if (!perm) return false;
  return usuarioPodeVerMenuModuloOperacional(user, href, perm);
}

/**
 * Menu lateral: perfil de projeto exclusivo vê o módulo do projeto + itens com permissão
 * explícita no grupo (ex.: {@code cidadao.menu} para Técnico Caminhão).
 */
export function userCanSeeMenuHref(
  user: AuthenticationModel | null | undefined,
  href: string
): boolean {
  if (href === '/') {
    return usuarioPodeVerMenuInicio(user);
  }
  const perfilExclusivo = obterPerfilProjetoExclusivo(user);
  if (perfilExclusivo && href === hrefMenuPerfilProjetoExclusivo(perfilExclusivo)) {
    return true;
  }
  return podeVerMenuHrefComPermissao(user, href);
}

/** Caixa de entrada (sino): listar e marcar como lida. */
export function usuarioPodeUsarInboxMensagens(user: AuthenticationModel | null | undefined): boolean {
  return hasPermission(user, 'mensagem.listar');
}

/** Tela administrativa /admin/mensagens. */
export function usuarioPodeAdministrarMensagens(
  user: AuthenticationModel | null | undefined
): boolean {
  return hasPermission(user, 'mensagem-admin.pagina');
}

/**
 * Acesso à tela do recurso — apenas {@code recurso.pagina}.
 * Para menu use {@link usuarioPodeVerMenuRecurso}; para API use {@link usuarioPodeListarRecurso}.
 */
export function usuarioPodeAcessarRecurso(
  user: AuthenticationModel | null | undefined,
  recurso: string
): boolean {
  return usuarioPodeAcessarPaginaRecurso(user, recurso);
}

/** Página de projeto: aceita permissões do módulo ou do recurso de atendimento. */
export function usuarioPodeAcessarPaginaProjeto(
  user: AuthenticationModel | null | undefined,
  recursoModulo: string
): boolean {
  if (usuarioPodeAcessarPaginaRecurso(user, recursoModulo)) return true;
  return usuarioPodeAcessarPaginaRecurso(user, `${recursoModulo}-atendimento`);
}

/** Analista, Administrador, Secretário (e escopo {@code listar-todos}) — sem módulo na coordenação. */
export function usuarioTemVisaoGeralDashboardProjetos(
  user: AuthenticationModel | null | undefined
): boolean {
  return usuarioTemVisaoGeralDeEquipamentos(user);
}

/**
 * Aba do dashboard quando o perfil tem {@code dashboard-projetos} e o módulo na coordenação
 * (sem exigir {@code caminhao-cidadao.listar} etc.).
 */
export function usuarioPodeVerDashboardProjetoModulo(
  user: AuthenticationModel | null | undefined,
  chave: string
): boolean {
  if (!usuarioPodeAcessarPaginaRecurso(user, 'dashboard-projetos')) {
    return false;
  }
  if (usuarioTemVisaoGeralDashboardProjetos(user)) {
    return true;
  }
  return usuarioTemModuloOperacional(user, chave);
}

/**
 * Aba do Dashboard Projetos — exige {@code dashboard-projetos-{aba}.pagina}.
 */
export function usuarioPodeVerAbaDashboardProjeto(
  user: AuthenticationModel | null | undefined,
  aba: 'vapt-vupt' | 'casa-cidadao' | 'caminhao-cidadao'
): boolean {
  return usuarioPodeAcessarPaginaRecurso(user, `dashboard-projetos-${aba}`);
}

/** Aba Vapt Vupt na tela /dashboard-projetos. */
export function usuarioPodeVerDashboardVaptVupt(
  user: AuthenticationModel | null | undefined
): boolean {
  return usuarioPodeVerAbaDashboardProjeto(user, 'vapt-vupt');
}

/** Aba Casa do Cidadão na tela /dashboard-projetos. */
export function usuarioPodeVerDashboardCasaCidadao(
  user: AuthenticationModel | null | undefined
): boolean {
  return usuarioPodeVerAbaDashboardProjeto(user, 'casa-cidadao');
}

/** Aba Caminhão do Cidadão na tela /dashboard-projetos. */
export function usuarioPodeVerDashboardCaminhaoCidadao(
  user: AuthenticationModel | null | undefined
): boolean {
  return usuarioPodeVerAbaDashboardProjeto(user, 'caminhao-cidadao');
}

/** Menu Dashboard Projetos — {@code dashboard-projetos.menu} ou menu de alguma aba. */
export function usuarioPodeVerMenuDashboardProjetos(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    usuarioPodeVerMenuRecurso(user, 'dashboard-projetos') ||
    usuarioPodeVerMenuRecurso(user, 'dashboard-projetos-vapt-vupt') ||
    usuarioPodeVerMenuRecurso(user, 'dashboard-projetos-casa-cidadao') ||
    usuarioPodeVerMenuRecurso(user, 'dashboard-projetos-caminhao-cidadao')
  );
}

/** Rota e tela /dashboard-projetos (página principal ou alguma aba com {@code .pagina}). */
export function usuarioPodeAcessarPaginaDashboardProjetos(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    usuarioPodeAcessarPaginaRecurso(user, 'dashboard-projetos') ||
    usuarioPodeVerDashboardVaptVupt(user) ||
    usuarioPodeVerDashboardCasaCidadao(user) ||
    usuarioPodeVerDashboardCaminhaoCidadao(user)
  );
}

/** Espelha {@code EscopoDadosPermissaoUtils.resolverEscopoEquipamento} na API. */
export type EscopoEquipamento = 'TODOS' | 'COORDENACAO' | 'VINCULADOS' | 'NENHUM';

export function resolverEscopoEquipamento(
  user: AuthenticationModel | null | undefined
): EscopoEquipamento {
  if (
    hasPermission(user, 'equipamento.listar-vinculados') ||
    hasPermission(user, 'estatistica.listar-vinculados')
  ) {
    return 'VINCULADOS';
  }
  if (
    hasPermission(user, 'equipamento.listar-coordenacao') ||
    hasPermission(user, 'estatistica.listar-coordenacao')
  ) {
    return 'COORDENACAO';
  }
  if (
    hasPermission(user, 'equipamento.listar-todos') ||
    hasPermission(user, 'estatistica.listar-todos')
  ) {
    return 'TODOS';
  }
  return 'NENHUM';
}

/**
 * Visão ampla (Analista/Administrador): ignora escopo de módulos operacionais no menu.
 * Só vale com escopo {@code TODOS} — ter {@code listar-todos} junto com escopo mais
 * restritivo não deve liberar projetos de outra coordenação.
 */
export function usuarioTemEscopoEquipamentoAmplo(
  user: AuthenticationModel | null | undefined
): boolean {
  return resolverEscopoEquipamento(user) === 'TODOS';
}

/** Mapas interativos (admin). */
export function usuarioPodeAcessarMapasInterativos(
  user: AuthenticationModel | null | undefined
): boolean {
  return hasPermission(user, 'mapa-interativo.pagina');
}

/** Gestão SPS sem visão ampla de cadastros. */
export function usuarioEhGestaoSpsExclusivo(user: AuthenticationModel | null | undefined): boolean {
  return (
    hasPermission(user, 'equipamento.menu') &&
    !hasPermission(user, 'usuario.menu')
  );
}

/** Perfil técnico (nome do grupo em {@link AuthenticationModel.roles}). */
export function usuarioEhTecnico(user: AuthenticationModel | null | undefined): boolean {
  return (
    user?.roles?.some((r) => {
      const n = String(r).normalize('NFD').replace(/\p{M}/gu, '').trim().toLowerCase();
      return n === 'tecnico' || n === 'técnico';
    }) ?? false
  );
}
