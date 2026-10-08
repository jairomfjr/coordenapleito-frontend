import type { AuthenticationModel } from '@/types/api';
import { mergeRolesFromApiUser } from '@/lib/authRoles';
import {
  hasPermission,
  usuarioTemEscopoEquipamentoAmplo,
} from '@/lib/permissions';

/** Rotas do menu → chave do módulo operacional (escopo por coordenação). */
export const HREF_MODULO_CHAVE: Record<string, string> = {
  '/projetos/vapt-vupt': 'vapt-vupt',
  '/projetos/casa-cidadao': 'casa-cidadao',
  '/projetos/caminhao-cidadao': 'caminhao-cidadao',
  '/coordenacao-basica': 'coordenacao-basica',
  '/inclusao-social': 'inclusao-social',
  '/servicos-vapt-vupt': 'vapt-vupt',
  '/orgao-vapt-vupt': 'vapt-vupt',
};

/** Prefixos de rota → chave do módulo (guard de página). */
export const ROTA_PREFIXO_MODULO: { prefix: string; chave: string }[] = [
  { prefix: '/projetos/vapt-vupt', chave: 'vapt-vupt' },
  { prefix: '/projetos/casa-cidadao', chave: 'casa-cidadao' },
  { prefix: '/projetos/caminhao-cidadao', chave: 'caminhao-cidadao' },
  { prefix: '/coordenacao-basica', chave: 'coordenacao-basica' },
  { prefix: '/inclusao-social', chave: 'inclusao-social' },
  { prefix: '/servicos-vapt-vupt', chave: 'vapt-vupt' },
  { prefix: '/orgao-vapt-vupt', chave: 'vapt-vupt' },
].sort((a, b) => b.prefix.length - a.prefix.length);

const RECURSO_POR_CHAVE: Record<string, string> = {
  'vapt-vupt': 'vapt-vupt',
  'casa-cidadao': 'casa-cidadao',
  'caminhao-cidadao': 'caminhao-cidadao',
  'coordenacao-basica': 'coordenacao-basica',
  'inclusao-social': 'inclusao-social',
};

/** Espelha {@code EscopoCoordenacaoUsuarioUtils.nomeGrupoIndicaVisaoGeral}. */
const GRUPOS_VISAO_GERAL_MODULO = new Set([
  'Analista',
  'Administrador',
  'Secretário',
  'Secretario',
  'Gestão SPS',
]);

function normalizarNomeGrupo(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .toLowerCase();
}

/** Espelha {@code EscopoCoordenacaoUsuarioUtils.listaGruposIndicaEscopoPorCoordenacao}. */
function listaGruposIndicaEscopoPorCoordenacao(
  user: AuthenticationModel | null | undefined
): boolean {
  return mergeRolesFromApiUser(user).some((g) => {
    const n = normalizarNomeGrupo(g);
    if (n.includes('tecnico caminhao') || n.includes('tecnico casa cidadao')) {
      return false;
    }
    return n === 'coordenador' || n === 'supervisor' || n === 'tecnico';
  });
}

/**
 * Espelha {@code EscopoCoordenacaoUsuarioUtils.temVisaoGeralDeEquipamentos}:
 * Analista/Administrador/Secretário/Gestão SPS ignoram vínculo por coordenação nos módulos,
 * mesmo quando o JWT acumula {@code listar-vinculados} / {@code listar-coordenacao} do catálogo completo.
 */
export function usuarioTemVisaoGeralDeEquipamentos(
  user: AuthenticationModel | null | undefined
): boolean {
  if (listaGruposIndicaEscopoPorCoordenacao(user)) {
    return false;
  }
  if (mergeRolesFromApiUser(user).some((g) => GRUPOS_VISAO_GERAL_MODULO.has(g))) {
    return true;
  }
  return usuarioTemEscopoEquipamentoAmplo(user);
}

export function chaveModuloParaHref(href: string): string | undefined {
  if (HREF_MODULO_CHAVE[href]) return HREF_MODULO_CHAVE[href];
  for (const { prefix, chave } of ROTA_PREFIXO_MODULO) {
    if (href === prefix || href.startsWith(`${prefix}/`)) return chave;
  }
  return undefined;
}

export function chaveModuloParaPathname(pathname: string): string | undefined {
  for (const { prefix, chave } of ROTA_PREFIXO_MODULO) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return chave;
  }
  return undefined;
}

export function usuarioTemPerfilCoordenacao(
  user: AuthenticationModel | null | undefined
): boolean {
  return hasPermission(user, 'equipamento.listar-coordenacao');
}

export function usuarioTemPerfilVinculados(
  user: AuthenticationModel | null | undefined
): boolean {
  return hasPermission(user, 'equipamento.listar-vinculados');
}

/** Coordenador ou Supervisor — acesso a módulo operacional da própria coordenação. */
export function usuarioTemPerfilOperacionalModulo(
  user: AuthenticationModel | null | undefined
): boolean {
  return usuarioTemPerfilCoordenacao(user) || usuarioTemPerfilVinculados(user);
}

export function usuarioTemModuloOperacional(
  user: AuthenticationModel | null | undefined,
  chave: string
): boolean {
  if (!chave) return false;
  return (user?.modulosOperacionais ?? []).includes(chave);
}

function temPermissaoAcaoRecurso(
  user: AuthenticationModel | null | undefined,
  recurso: string,
  acao: 'menu' | 'pagina',
  permissaoExplicita?: string
): boolean {
  if (permissaoExplicita && hasPermission(user, permissaoExplicita)) {
    return true;
  }
  return hasPermission(user, `${recurso}.${acao}`);
}

function atendeEscopoModuloOperacional(
  user: AuthenticationModel | null | undefined,
  chave: string
): boolean {
  if (usuarioTemVisaoGeralDeEquipamentos(user)) {
    return true;
  }
  return usuarioTemModuloOperacional(user, chave);
}

/** Menu de módulo operacional — exige {@code recurso.menu} e escopo da coordenação. */
export function usuarioPodeVerMenuModuloOperacional(
  user: AuthenticationModel | null | undefined,
  href: string,
  menuPermission: string
): boolean {
  const chave = chaveModuloParaHref(href);
  if (!chave) {
    return hasPermission(user, menuPermission);
  }

  const recurso = RECURSO_POR_CHAVE[chave] ?? chave;
  if (!temPermissaoAcaoRecurso(user, recurso, 'menu', menuPermission)) {
    return false;
  }
  return atendeEscopoModuloOperacional(user, chave);
}

/** Página de módulo operacional — exige {@code recurso.pagina} e escopo da coordenação. */
export function usuarioPodeAcessarPaginaModuloOperacional(
  user: AuthenticationModel | null | undefined,
  chave: string,
  paginaPermission?: string
): boolean {
  const recurso = RECURSO_POR_CHAVE[chave] ?? chave;
  if (!temPermissaoAcaoRecurso(user, recurso, 'pagina', paginaPermission)) {
    return false;
  }
  return atendeEscopoModuloOperacional(user, chave);
}

/**
 * Compatibilidade com chamadas existentes — equivale a {@link usuarioPodeAcessarPaginaModuloOperacional}.
 */
export function usuarioPodeAcessarModuloOperacional(
  user: AuthenticationModel | null | undefined,
  chave: string,
  paginaPermission?: string
): boolean {
  return usuarioPodeAcessarPaginaModuloOperacional(user, chave, paginaPermission);
}
