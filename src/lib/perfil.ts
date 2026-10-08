import type { AuthenticationModel } from '@/types/api';

/** Nomes do grupo na tabela `grupo` (backend). */
const GRUPO_TECNICO = 'Técnico';
const GRUPO_TECNICO_SEM_ACENTO = 'Tecnico';

function normalizarNomeGrupo(s: string): string {
  return s.normalize('NFC').trim();
}

/**
 * Perfil Técnico (grupo no usuário ou claim equivalente nas authorities).
 * Alinhado a {@code AplicaContextoEquipamentoFilterService} no backend.
 */
export function isPerfilTecnico(user: AuthenticationModel | null | undefined): boolean {
  if (!user) return false;
  const roles = user.roles ?? [];
  for (const r of roles) {
    if (typeof r !== 'string') continue;
    const t = normalizarNomeGrupo(r);
    if (t === GRUPO_TECNICO || t === GRUPO_TECNICO_SEM_ACENTO) return true;
  }
  const authorities = user.authorities ?? [];
  return authorities.some((a) => {
    const s = String(a).trim();
    return s === 'ROLE_TECNICO' || /^ROLE_?TECNICO$/i.test(s.replace(/\s/g, '_'));
  });
}
