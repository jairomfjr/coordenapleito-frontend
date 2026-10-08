'use client';

import type { ImgHTMLAttributes } from 'react';
import { useAuthenticatedMediaUrl } from '@/hooks/useAuthenticatedMediaUrl';

type AuthenticatedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  /** Caminho da API, ex.: `/coordenapleito-api/organogramas/{codigo}/foto` */
  mediaPath: string;
  enabled?: boolean;
};

/**
 * Imagem em endpoint JWT-protegido (o {@code <img>} nativo não envia Authorization).
 */
export function AuthenticatedImage({
  mediaPath,
  enabled = true,
  alt = '',
  ...imgProps
}: AuthenticatedImageProps) {
  const src = useAuthenticatedMediaUrl(mediaPath, enabled);

  if (!src) {
    return null;
  }

  return <img {...imgProps} src={src} alt={alt} />;
}
