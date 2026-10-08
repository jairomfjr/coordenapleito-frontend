/**
 * Evita que a página de login faça `router.replace('/')` após um login bem-sucedido,
 * sobrescrevendo a navegação feita no AuthContext após login.
 */
const KEY = 'coordenapleito:loginNavigationPending';

export function markPostLoginNavigationPending(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(KEY, '1');
}

/**
 * @returns true se havia flag pendente (fluxo pós-login acabou de navegar) — a flag é removida.
 */
export function consumePostLoginNavigationPending(): boolean {
  if (typeof window === 'undefined') return false;
  if (sessionStorage.getItem(KEY) !== '1') return false;
  sessionStorage.removeItem(KEY);
  return true;
}
