/**
 * @deprecated Use `routePermissions.ts`, `permissions.ts` e `listagemAuthRecurso.ts`.
 * Mantido apenas para referência de migração; não importar em código novo.
 *
 * Regras de acesso por rota (alinhadas ao menu lateral).
 * Rotas de Coordenadoria (coordenação básica / inclusão social) dependem de API e são tratadas nas próprias páginas.
 *
 * Regra de negócio: o perfil **Analista** tem visão geral de todo o sistema (cadastros, equipamentos, programas,
 * coordenadoria, etc.) sem restrição de escopo nos dados. A única filtragem opcional é o contexto de equipamento
 * (header X-Equipment-Context-ID / modal no header), que restringe listagens ao equipamento escolhido até o usuário
 * limpar o contexto.
 */

/** Nome do grupo no backend (tabela `grupo.nome`). */
export const ROLE_GESTAO_SPS = 'Gestão SPS';

/** Perfis que podem ver os menus "Dados básicos" e "Administração". */
export const ROLES_DADOS_BASICOS_E_ADMIN = ['Analista', 'Administrador'];

/** Reenvio de senha na listagem de usuários (somente Analista e Administrador). */
export const ROLES_USUARIO_REENVIO_SENHA = ROLES_DADOS_BASICOS_E_ADMIN;

/**
 * Perfil "Secretário" / "Secretario" (sem acentuação) — alinhado ao token {@code ROLE_SECRETARIO} na API.
 */
const SECRETARIO_PERFIS = ['Secretário', 'Secretario'] as const;
export const ROLES_SECRETARIO: string[] = [...SECRETARIO_PERFIS];

/**
 * Itens de cadastro em "Dados básicos" reservados a Analista, Administrador e Secretário
 * (ex.: Cargo, Partido político).
 */
export const ROLES_CARGO = ['Analista', 'Administrador', ...SECRETARIO_PERFIS];

/**
 * Menu e rota {@code /autoridades} (independente, como cidadãos): Analista, Administrador (perfil
 * “administrativo” no requisito) e Secretário.
 */
export const ROLES_AUTORIDADES = ['Analista', 'Administrador', ...SECRETARIO_PERFIS];
/** Menu `/organograma` e página dedicada: Analista, Administrador e Gestão SPS. */
export const ROLES_ORGANOGRAMA = ['Analista', 'Administrador', ROLE_GESTAO_SPS];

/**
 * Menu e rota {@code /demandas-municipio}: mesmo conjunto de perfis de Autoridades
 * (Analista, Administrador e Secretário).
 */
export const ROLES_DEMANDAS_MUNICIPIO = ROLES_AUTORIDADES;

/** Perfis que podem ver o menu "Programas Sociais" (visão geral alinhada ao backend). */
export const ROLES_PROGRAMAS_SOCIAIS = [
  'Analista',
  'Administrador',
  'Secretário',
  'Secretario',
];

/** Perfis que podem ver o menu e a página Dashboard (e mapa tour). */
export const ROLES_DASHBOARD = ['Analista', 'Administrador', 'Secretário', 'Secretario', ROLE_GESTAO_SPS];

/** Perfis que podem ver o menu e a página Dashboard Projetos. */
export const ROLES_DASHBOARD_PROJETOS = ['Analista', 'Administrador', 'Secretário', 'Secretario'];

/**
 * Menu e rota `/dashboard-programas-sociais`: somente Analista, Administrador e Secretário
 * (não inclui Gestão SPS nem outros perfis de Programas Sociais).
 */
export const ROLES_DASHBOARD_PROGRAMAS_SOCIAIS = ['Analista', 'Administrador', ...SECRETARIO_PERFIS];

/** Perfis que podem ver o menu e a página Mapa Social. */
export const ROLES_MAPA_SOCIAL = ['Analista', 'Administrador', ...SECRETARIO_PERFIS];

/**
 * Mapas interativos (admin): somente Analista, Administrador e Secretário.
 * Páginas em `/dashboard/mapas` e item no menu Administração.
 */
export const ROLES_MAPAS_INTERATIVOS = ['Analista', 'Administrador', ...SECRETARIO_PERFIS];

const PREFIXOS_MAPAS_INTERATIVOS_ADMIN = ['/dashboard/mapas'] as const;

/** @deprecated Use {@link usuarioPodeAcessarMapasInterativos} em `@/lib/permissions`. */
export { usuarioPodeAcessarMapasInterativos } from '@/lib/permissions';

/**
 * Menu "Projetos" → VAPT VUPT e rota `/projetos/vapt-vupt`: Analista, Administrador e Secretário
 * (alinhado ao {@code VaptVuptAtendimentoController} na API).
 */
export const ROLES_PROJETOS_VAPT_VUPT = ['Analista', 'Administrador', ...SECRETARIO_PERFIS];

/** Nomes dos grupos no cadastro (tabela `grupo.nome`). */
export const ROLE_TECNICO_CASA_CIDADAO = 'Técnico Casa Cidadão';
export const ROLE_TECNICO_CAMINHAO = 'Técnico Caminhão';
export const ROLE_COORDENADOR = 'Coordenador';

export type AcessoRotaContexto = {
  coordenacaoIdUsuario?: number | null;
  coordenacaoProjetosCidadaniaId?: number | null;
  authorities?: string[] | null;
};

function usuarioTemPerfilCoordenador(
  roles: string[] | undefined,
  authorities?: string[] | null
): boolean {
  if (roles?.some((r) => r === ROLE_COORDENADOR || r.toLowerCase() === 'coordenador')) return true;
  return Boolean(
    authorities?.some((a) => {
      const s = a?.trim().toUpperCase() ?? '';
      return s === 'ROLE_COORDENADOR' || s === 'COORDENADOR';
    })
  );
}

/** Coordenador vinculado à coordenação de Projetos (Cidadania), conforme API/config. */
export function usuarioEhCoordenadorProjetosCidadania(
  roles: string[] | undefined,
  coordenacaoIdUsuario: number | null | undefined,
  coordenacaoProjetosCidadaniaId: number | null | undefined,
  authorities?: string[] | null
): boolean {
  if (coordenacaoProjetosCidadaniaId == null || coordenacaoProjetosCidadaniaId <= 0) return false;
  if (!usuarioTemPerfilCoordenador(roles, authorities)) return false;
  if (coordenacaoIdUsuario == null) return false;
  return Number(coordenacaoIdUsuario) === Number(coordenacaoProjetosCidadaniaId);
}

/**
 * Menu e rota `/projetos/casa-cidadao` (inclui perfil exclusivo Técnico Casa Cidadão).
 */
export const ROLES_PROJETOS_CASA_CIDADAO = [
  'Analista',
  'Administrador',
  ...SECRETARIO_PERFIS,
  ROLE_TECNICO_CASA_CIDADAO,
];

/**
 * Menu e rota `/projetos/caminhao-cidadao` (Caminhão do Cidadão): Analista, Administrador e Técnico Caminhão.
 */
export const ROLES_PROJETOS_CAMINHAO = ['Analista', 'Administrador', ROLE_TECNICO_CAMINHAO];

/** Perfis que ampliam o escopo além dos técnicos de projeto restritos. */
const PERFIS_ACESSO_AMPLIO = [
  'Analista',
  'Administrador',
  'Secretário',
  'Secretario',
  ROLE_GESTAO_SPS,
  'Coordenador',
  'Supervisor',
  'Técnico',
];

/** Menu e rota `/servicos-vapt-vupt`: exclusivo do perfil Analista. */
export const ROLES_SERVICO_VAPT_VUPT = ['Analista'];

/** Menu e rota `/orgao-vapt-vupt` (dados básicos): exclusivo do perfil Analista. */
export const ROLES_ORGAO_VAPT_VUPT = ['Analista'];

/** Perfis que veem todos os itens do menu Coordenadoria (Coord. Básica e Inclusão Social). */
export const ROLES_COORDENADORIA_VER_TODOS = [
  'Analista',
  'Administrador',
  'Secretário',
  'Secretario',
  ROLE_GESTAO_SPS,
];

/** Perfis que podem ver o menu Acolhimentos (alinhado a {@code AcolhimentoController} na API). */
export const ROLES_ACOLHIMENTOS = ['Analista', 'Administrador', ROLE_GESTAO_SPS];

/**
 * Menu e página `/coordenacoes`: Analista, Administrador e Gestão SPS.
 * Coordenador, Técnico e Supervisor não acessam a tela (API de listagem pode seguir disponível para outros fluxos).
 */
export const ROLES_COORDENACOES_LEITURA = ['Analista', 'Administrador', ROLE_GESTAO_SPS];

export const MENSAGEM_SEM_PERMISSAO_PAGINA =
  'Você não tem permissão para acessar esta página.';

const PREFIXOS_DADOS_BASICOS = [
  '/generos',
  '/etnias',
  '/orientacoes-sexuais',
  '/periodos-acoes',
  '/periodos',
  '/acoes',
  '/tipos-acolhimento',
  '/tipos-equipamento',
  '/categorias',
  '/tipos-servico',
  '/servicos',
  '/servicos-caminhao',
];

const PREFIXOS_SERVICO_VAPT_VUPT = ['/servicos-vapt-vupt'];

const PREFIXOS_ORGAO_VAPT_VUPT = ['/orgao-vapt-vupt'];

const PREFIXOS_PROJETOS_VAPT_VUPT = ['/projetos/vapt-vupt'];
const PREFIXOS_PROJETOS_CASA_CIDADAO = ['/projetos/casa-cidadao'];
const PREFIXOS_PROJETOS_CAMINHAO = ['/projetos/caminhao-cidadao'];

const PREFIXOS_PERMITIDOS_TECNICO_CASA_CIDADAO_EXCLUSIVO = [...PREFIXOS_PROJETOS_CASA_CIDADAO];
const PREFIXOS_PERMITIDOS_TECNICO_CAMINHAO_EXCLUSIVO = [...PREFIXOS_PROJETOS_CAMINHAO];

/** Subconjunto de "Dados básicos" permitido ao perfil exclusivo Gestão SPS (sem Analista/Administrador). */
const PREFIXOS_DADOS_BASICOS_GESTAO_SPS = [
  '/tipos-equipamento',
  '/categorias',
  '/tipos-servico',
  '/servicos',
  '/coordenacoes',
];

/** Rotas permitidas ao perfil exclusivo Gestão SPS (demais rotas autenticadas são bloqueadas). */
const PREFIXOS_PERMITIDOS_GESTAO_SPS_EXCLUSIVO = [
  ...PREFIXOS_DADOS_BASICOS_GESTAO_SPS,
  '/organograma',
  '/dashboard',
  '/mapa-tour',
  '/equipamentos',
  '/equipamento-servicos',
  '/cidadaos',
  '/coordenacao-basica',
  '/inclusao-social',
  '/periodos',
  '/periodos-acoes',
];

const PREFIXOS_ADMINISTRACAO = ['/usuarios', '/grupos', '/permissoes'];

const PREFIXOS_PROGRAMAS_SOCIAIS = ['/cmic', '/ceara-sem-fome', '/vale-gas', '/secofi'];

/** Rotas com checagem assíncrona (equipamentos vinculados ao perfil). */
const PREFIXOS_COORDENADORIA_ASYNC = ['/coordenacao-basica', '/inclusao-social'];

type Rule = { prefix: string; roles: string[] };

function buildStaticRules(): Rule[] {
  const rules: Rule[] = [];
  for (const prefix of PREFIXOS_DADOS_BASICOS) {
    rules.push({ prefix, roles: ROLES_DADOS_BASICOS_E_ADMIN });
  }
  for (const prefix of PREFIXOS_SERVICO_VAPT_VUPT) {
    rules.push({ prefix, roles: ROLES_SERVICO_VAPT_VUPT });
  }
  for (const prefix of PREFIXOS_ORGAO_VAPT_VUPT) {
    rules.push({ prefix, roles: ROLES_ORGAO_VAPT_VUPT });
  }
  for (const prefix of PREFIXOS_PROJETOS_VAPT_VUPT) {
    rules.push({ prefix, roles: ROLES_PROJETOS_VAPT_VUPT });
  }
  for (const prefix of PREFIXOS_PROJETOS_CASA_CIDADAO) {
    rules.push({ prefix, roles: ROLES_PROJETOS_CASA_CIDADAO });
  }
  for (const prefix of PREFIXOS_PROJETOS_CAMINHAO) {
    rules.push({ prefix, roles: ROLES_PROJETOS_CAMINHAO });
  }
  rules.push({ prefix: '/cargos', roles: ROLES_CARGO });
  rules.push({ prefix: '/partidos-politicos', roles: ROLES_CARGO });
  rules.push({ prefix: '/autoridades', roles: ROLES_AUTORIDADES });
  rules.push({ prefix: '/organograma', roles: ROLES_ORGANOGRAMA });
  rules.push({ prefix: '/demandas-municipio', roles: ROLES_DEMANDAS_MUNICIPIO });
  rules.push({ prefix: '/coordenacoes', roles: ROLES_COORDENACOES_LEITURA });
  for (const prefix of PREFIXOS_ADMINISTRACAO) {
    rules.push({ prefix, roles: ROLES_DADOS_BASICOS_E_ADMIN });
  }
  for (const prefix of PREFIXOS_PROGRAMAS_SOCIAIS) {
    rules.push({ prefix, roles: ROLES_PROGRAMAS_SOCIAIS });
  }
  rules.push({ prefix: '/dashboard', roles: ROLES_DASHBOARD });
  for (const prefix of PREFIXOS_MAPAS_INTERATIVOS_ADMIN) {
    rules.push({ prefix, roles: ROLES_MAPAS_INTERATIVOS });
  }
  rules.push({ prefix: '/dashboard-projetos', roles: ROLES_DASHBOARD_PROJETOS });
  rules.push({ prefix: '/dashboard-programas-sociais', roles: ROLES_DASHBOARD_PROGRAMAS_SOCIAIS });
  rules.push({ prefix: '/mapa-social', roles: ROLES_MAPA_SOCIAL });
  rules.push({ prefix: '/mapa-tour', roles: ROLES_DASHBOARD });
  rules.push({ prefix: '/acolhimentos', roles: ROLES_ACOLHIMENTOS });
  return rules.sort((a, b) => b.prefix.length - a.prefix.length);
}

const STATIC_RULES_SORTED = buildStaticRules();

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function usuarioTemAlgumPerfil(roles: string[] | undefined, permitidos: string[]): boolean {
  const r = roles ?? [];
  return permitidos.some((p) => r.includes(p));
}

/** Usuário só com Gestão SPS (sem Analista nem Administrador): visão reduzida de rotas. */
export function usuarioEhGestaoSpsExclusivo(roles: string[] | undefined): boolean {
  if (!roles?.length) return false;
  if (!roles.includes(ROLE_GESTAO_SPS)) return false;
  const elevado = roles.some((r) => r === 'Analista' || r === 'Administrador');
  return !elevado;
}

/**
 * Perfil restrito a um único módulo em Projetos (sem Analista/Administrador/Secretário etc.).
 * Retorna qual módulo ou null se o usuário tem visão ampla.
 */
export function obterPerfilProjetoExclusivo(
  roles: string[] | undefined
): 'casa-cidadao' | 'caminhao' | null {
  if (!roles?.length) return null;
  if (roles.some((r) => PERFIS_ACESSO_AMPLIO.includes(r))) return null;
  const casa = roles.includes(ROLE_TECNICO_CASA_CIDADAO);
  const caminhao = roles.includes(ROLE_TECNICO_CAMINHAO);
  if (casa && !caminhao) return 'casa-cidadao';
  if (caminhao && !casa) return 'caminhao';
  if (casa && caminhao) return 'casa-cidadao';
  return null;
}

export function usuarioMenuRestritoProjetos(roles: string[] | undefined): boolean {
  return obterPerfilProjetoExclusivo(roles) != null;
}

/** Rota inicial após login ou quando o acesso à página atual é negado. */
export function rotaInicialParaUsuario(roles: string[] | undefined): string {
  const perfil = obterPerfilProjetoExclusivo(roles);
  if (perfil === 'casa-cidadao') return '/projetos/casa-cidadao';
  if (perfil === 'caminhao') return '/projetos/caminhao-cidadao';
  return '/';
}

/**
 * Retorna true se a rota exige perfis que o usuário não possui (checagem só por prefixo + perfis).
 * Não cobre {@link PREFIXOS_COORDENADORIA_ASYNC} — retorna false para essas rotas.
 */
function rotaProjetosCidadaniaPermitida(
  pathname: string,
  userRoles: string[] | undefined,
  ctx?: AcessoRotaContexto
): boolean {
  const casa =
    pathMatchesPrefix(pathname, '/projetos/casa-cidadao') &&
    (usuarioTemAlgumPerfil(userRoles, ROLES_PROJETOS_CASA_CIDADAO) ||
      usuarioEhCoordenadorProjetosCidadania(
        userRoles,
        ctx?.coordenacaoIdUsuario,
        ctx?.coordenacaoProjetosCidadaniaId,
        ctx?.authorities
      ));
  const caminhao =
    pathMatchesPrefix(pathname, '/projetos/caminhao-cidadao') &&
    (usuarioTemAlgumPerfil(userRoles, ROLES_PROJETOS_CAMINHAO) ||
      usuarioEhCoordenadorProjetosCidadania(
        userRoles,
        ctx?.coordenacaoIdUsuario,
        ctx?.coordenacaoProjetosCidadaniaId,
        ctx?.authorities
      ));
  return casa || caminhao;
}

export function rotaEstaticaNegadaParaUsuario(
  pathname: string,
  userRoles: string[] | undefined,
  ctx?: AcessoRotaContexto
): boolean {
  // Catálogo e mapas publicados são acessíveis sem perfil do sistema
  if (pathname === '/mapas/publico' || pathname.startsWith('/mapas/publico/')) {
    return false;
  }
  if (PREFIXOS_COORDENADORIA_ASYNC.some((p) => pathMatchesPrefix(pathname, p))) {
    return false;
  }
  if (usuarioEhGestaoSpsExclusivo(userRoles)) {
    if (pathname === '/' || pathname === '') {
      return false;
    }
    if (pathMatchesPrefix(pathname, '/relatorios')) {
      return true;
    }
    for (const p of PREFIXOS_PERMITIDOS_GESTAO_SPS_EXCLUSIVO) {
      if (pathMatchesPrefix(pathname, p)) {
        return false;
      }
    }
    return true;
  }
  const perfilProjeto = obterPerfilProjetoExclusivo(userRoles);
  if (perfilProjeto === 'casa-cidadao') {
    for (const p of PREFIXOS_PERMITIDOS_TECNICO_CASA_CIDADAO_EXCLUSIVO) {
      if (pathMatchesPrefix(pathname, p)) {
        return false;
      }
    }
    return true;
  }
  if (perfilProjeto === 'caminhao') {
    for (const p of PREFIXOS_PERMITIDOS_TECNICO_CAMINHAO_EXCLUSIVO) {
      if (pathMatchesPrefix(pathname, p)) {
        return false;
      }
    }
    return true;
  }
  if (rotaProjetosCidadaniaPermitida(pathname, userRoles, ctx)) {
    return false;
  }
  for (const rule of STATIC_RULES_SORTED) {
    if (!pathMatchesPrefix(pathname, rule.prefix)) continue;
    return !usuarioTemAlgumPerfil(userRoles, rule.roles);
  }
  return false;
}
