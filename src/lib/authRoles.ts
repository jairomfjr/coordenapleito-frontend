import type { AuthenticationModel } from '@/types/api';

const SECRETARIO_GRUPO_NOMES = new Set(['Secretário', 'Secretario']);

/**
 * Sufixo após "ROLE_" nas authorities (JWT / tabela permissao.nome) → nome do grupo em `grupo.nome`.
 * Cobre variações comuns quando o banco ou o token não batem com o literal usado no menu.
 */
const ROLE_SUFFIX_TO_GRUPO_NOME: Record<string, string> = {
  ANALISTA: 'Analista',
  ADMINISTRADOR: 'Administrador',
  SECRETARIO: 'Secretário',
  'SECRETÁRIO': 'Secretário',
  COORDENADOR: 'Coordenador',
  SUPERVISOR: 'Supervisor',
  TECNICO: 'Técnico',
  'GESTÃO_SPS': 'Gestão SPS',
  GESTAO_SPS: 'Gestão SPS',
};

/** Normaliza capitalização / acentos comuns vindos do banco ou de integrações. */
const ALIAS_LOWER_TO_GRUPO: Record<string, string> = {
  analista: 'Analista',
  administrador: 'Administrador',
  secretario: 'Secretário',
  secretário: 'Secretário',
  coordenador: 'Coordenador',
  supervisor: 'Supervisor',
  tecnico: 'Técnico',
  técnico: 'Técnico',
  'gestão sps': 'Gestão SPS',
  'gestao sps': 'Gestão SPS',
  'tecnico caminhao': 'Técnico Caminhão',
  'técnico caminhão': 'Técnico Caminhão',
  'tecnico casa cidadao': 'Técnico Casa Cidadão',
  'técnico casa cidadão': 'Técnico Casa Cidadão',
};

function coalesceRolesArray(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map((x) => (x == null ? '' : String(x))).filter(Boolean);
  }
  return [String(raw)];
}

function canonicalGrupoNome(s: string): string {
  const t = s.normalize('NFC').trim();
  if (!t) return t;
  const alias = ALIAS_LOWER_TO_GRUPO[t.toLowerCase()];
  return alias ?? t;
}

/**
 * Monta a lista efetiva de perfis (nomes de grupo) para menus e guards.
 * Usa `roles` da API e complementa a partir de `authorities` (`ROLE_*`), para quando
 * o vínculo usuario_grupo está inconsistente mas as permissões do grupo existem.
 */
export function mergeRolesFromApiUser(user: AuthenticationModel | null | undefined): string[] {
  if (!user) return [];
  const out = new Set<string>();

  for (const r of coalesceRolesArray(user.roles)) {
    const t = canonicalGrupoNome(r);
    if (t) out.add(t);
  }

  const authorities = user.authorities ?? [];
  for (const a of authorities) {
    if (a == null || typeof a !== 'string') continue;
    const s = a.normalize('NFC').trim();
    if (!s.toUpperCase().startsWith('ROLE_')) continue;
    const tail = s.slice(5).normalize('NFC');
    const nome = ROLE_SUFFIX_TO_GRUPO_NOME[tail];
    if (nome) out.add(nome);
  }

  return [...out];
}

/** Igual a {@link mergeRolesFromApiUser}, retornando um novo objeto para o contexto. */
export function withMergedRoles(user: AuthenticationModel): AuthenticationModel {
  const permissoes =
    user.permissoes?.length ? user.permissoes : user.authorities?.length ? user.authorities : [];
  return {
    ...user,
    roles: mergeRolesFromApiUser(user),
    permissoes,
    authorities: permissoes,
  };
}

/**
 * Indica se o usuário possui o perfil Secretário (incluindo mapeamento via {@code authorities} / ROLE_).
 * Útil para roteamento pós-login quando {@code user.roles} ainda varia de fonte a fonte.
 */
export function isUsuarioSecretario(user: AuthenticationModel | null | undefined): boolean {
  if (!user) return false;
  for (const r of mergeRolesFromApiUser(user)) {
    if (SECRETARIO_GRUPO_NOMES.has(r)) return true;
  }
  for (const a of user.authorities ?? []) {
    if (a == null || typeof a !== 'string') continue;
    const s = a.normalize('NFC');
    if (!s.toUpperCase().startsWith('ROLE_')) continue;
    const tail = s
      .slice(5)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    if (tail === 'secretario') return true;
  }
  return false;
}
