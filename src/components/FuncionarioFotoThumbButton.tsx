'use client';

import { useEffect, useState } from 'react';
import { FuncionarioAvatar } from '@/components/FuncionarioAvatar';
import { useAuthenticatedMediaUrl } from '@/hooks/useAuthenticatedMediaUrl';
import { resolveProtectedMediaSources } from '@/lib/authenticatedMedia';
import modalStyles from '@/app/equipamentos/EquipamentosPage.module.css';

export interface FuncionarioFotoThumbButtonProps {
  /** URL blob local (preview). Não use caminho `/coordenapleito-api/.../foto` — use {@link mediaPath}. */
  src?: string;
  /** Caminho API protegida, ex. `/coordenapleito-api/organogramas/{id}/foto`. */
  mediaPath?: string;
  onOpen: () => void;
  ariaLabel: string;
}

/**
 * Miniatura na tabela: tenta carregar a foto; se falhar (404, rede, etc.), mostra o avatar.
 */
export function FuncionarioFotoThumbButton({
  src,
  mediaPath,
  onOpen,
  ariaLabel,
}: FuncionarioFotoThumbButtonProps) {
  const [failed, setFailed] = useState(false);
  const { blobSrc, apiPath } = resolveProtectedMediaSources(src, mediaPath);
  const authSrc = useAuthenticatedMediaUrl(apiPath ?? undefined, Boolean(apiPath));
  const resolvedSrc = blobSrc ?? authSrc;

  useEffect(() => {
    setFailed(false);
  }, [resolvedSrc]);

  if (!resolvedSrc || failed) {
    return (
      <span className={modalStyles.funcionariosFotoAvatarCell}>
        <FuncionarioAvatar size="sm" />
      </span>
    );
  }

  return (
    <button type="button" className={modalStyles.funcionariosFotoThumbBtn} onClick={onOpen} aria-label={ariaLabel}>
      <img
        className={modalStyles.funcionariosFotoThumb}
        src={resolvedSrc}
        alt=""
        onError={() => setFailed(true)}
      />
    </button>
  );
}
