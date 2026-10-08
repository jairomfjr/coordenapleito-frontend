'use client';

import { useEffect, useState } from 'react';
import { FuncionarioAvatar } from '@/components/FuncionarioAvatar';
import { useAuthenticatedMediaUrl } from '@/hooks/useAuthenticatedMediaUrl';
import { resolveProtectedMediaSources } from '@/lib/authenticatedMedia';
import styles from './FuncionarioFotoCircle.module.css';

export interface FuncionarioFotoCircleProps {
  /** URL da imagem (blob local) ou null. */
  imageSrc?: string | null;
  /** Foto em endpoint JWT, ex. `/coordenapleito-api/organogramas/{id}/foto`. */
  mediaPath?: string | null;
  /** Texto abaixo do quadro (ex.: "Foto do funcionário"). */
  label?: string;
  /** Se informado e houver imagem carregada, o quadro abre a visualização ampliada ao clicar. */
  onExpandClick?: () => void;
}

/**
 * Quadro 4:3 com borda tracejada: avatar se não houver foto ou se a URL falhar; imagem com contain.
 */
export function FuncionarioFotoCircle({
  imageSrc = null,
  mediaPath = null,
  label = 'Foto do funcionário',
  onExpandClick,
}: FuncionarioFotoCircleProps) {
  const [loadError, setLoadError] = useState(false);
  const { blobSrc, apiPath } = resolveProtectedMediaSources(imageSrc, mediaPath);
  const authSrc = useAuthenticatedMediaUrl(apiPath ?? undefined, Boolean(apiPath));
  const resolvedSrc = blobSrc ?? authSrc;

  useEffect(() => {
    setLoadError(false);
  }, [resolvedSrc]);

  const showPhoto = Boolean(resolvedSrc) && !loadError;
  const podeAmpliar = showPhoto && Boolean(onExpandClick);

  const avatarBlock = (
    <div className={styles.avatarSlot}>
      <FuncionarioAvatar size="lg" label="Sem foto — use a câmera ou envie um arquivo" />
    </div>
  );

  return (
    <div className={styles.root}>
      {podeAmpliar ? (
        <button
          type="button"
          className={styles.frameButton}
          onClick={onExpandClick}
          aria-label="Ampliar foto"
        >
          <img
            src={resolvedSrc!}
            alt=""
            className={styles.img}
            onError={() => setLoadError(true)}
          />
        </button>
      ) : showPhoto ? (
        <div className={styles.frame} aria-label="Foto do funcionário">
          <img
            src={resolvedSrc!}
            alt=""
            className={styles.img}
            onError={() => setLoadError(true)}
          />
        </div>
      ) : (
        <div className={styles.frame} aria-label={imageSrc ? 'Foto indisponível' : 'Sem foto'}>
          {avatarBlock}
        </div>
      )}
      <span className={styles.caption}>{label}</span>
      {podeAmpliar ? (
        <span className={styles.clickHint}>Clique na foto para ampliar</span>
      ) : null}
    </div>
  );
}
