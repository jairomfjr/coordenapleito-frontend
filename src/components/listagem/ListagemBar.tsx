'use client';

import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authRecursoParaPathname } from '@/lib/listagemAuthRecurso';
import { hasPermissionRecursoProjeto } from '@/lib/permissions';
import styles from './listagem.module.css';

interface ListagemBarProps {
  /** Placeholder do campo de busca (ex: "Busque pelo nome do equipamento"). Opcional: quando ausente, o campo de busca não é exibido */
  searchPlaceholder?: string;
  /** Valor controlado do campo de busca */
  searchValue?: string;
  /** Callback quando o texto de busca muda */
  onSearchChange?: (value: string) => void;
  /** Callback ao clicar em Filtros (aplicar filtros / buscar) */
  onFiltros?: () => void;
  /** Callback ao clicar em Limpar Filtros */
  onLimparFiltros?: () => void;
  /** Callback ao clicar em Cadastrar */
  onCadastrar?: () => void;
  /** Label do botão de cadastrar (ex: "Cadastrar", "Cadastrar Equipamento") */
  labelCadastrar?: string;
  /**
   * Recurso RBAC (ex.: {@code genero} → exige {@code genero.criar} para exibir Cadastrar).
   * Deve coincidir com o recurso do {@code @PreAuthorize} na API.
   */
  authRecurso?: string;
  /**
   * Filtros adicionais na **mesma linha** da busca (padrão do projeto). Renderizado entre busca e botões.
   * Use classes `barFiltroInline` ou `barFiltroComLabel` em `listagem.module.css`.
   */
  children?: React.ReactNode;
}

export function ListagemBar({
  searchPlaceholder,
  searchValue = '',
  onSearchChange,
  onFiltros,
  onLimparFiltros,
  onCadastrar,
  labelCadastrar = 'Cadastrar',
  authRecurso,
  children,
}: ListagemBarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const recurso =
    authRecurso ?? (pathname ? authRecursoParaPathname(pathname) : undefined);
  const podeCadastrar =
    onCadastrar != null &&
    recurso != null &&
    hasPermissionRecursoProjeto(user, recurso, 'criar');
  const showSearch = searchPlaceholder != null && onSearchChange != null;
  return (
    <div className={styles.bar}>
      {showSearch && (
        <div className={styles.searchWrap}>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Buscar"
            data-search-input
          />
          <Search size={18} className={styles.searchIcon} aria-hidden />
        </div>
      )}
      {children}
      <div className={styles.actions}>
        {onFiltros && (
          <button type="button" onClick={onFiltros} className={styles.btnFiltros}>
            Filtros
          </button>
        )}
        {onLimparFiltros && (
          <button type="button" onClick={onLimparFiltros} className={styles.btnLimpar}>
            Limpar Filtros
          </button>
        )}
        {podeCadastrar && (
          <button type="button" onClick={onCadastrar} className={styles.btnCadastrar}>
            {labelCadastrar}
          </button>
        )}
      </div>
    </div>
  );
}
