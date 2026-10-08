'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './ImageLightboxModal.module.css';

export interface ImageLightboxModalProps {
  open: boolean;
  onClose: () => void;
  src: string | null;
  /** Legenda abaixo da imagem (ex.: nome da pessoa). */
  caption?: string;
}

/**
 * Visualização ampliada da imagem (clique fora, Fechar ou Esc para sair).
 */
export function ImageLightboxModal({ open, onClose, src, caption }: ImageLightboxModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !src || typeof document === 'undefined') return null;
  const portalTarget = (document.fullscreenElement as HTMLElement | null) ?? document.body;

  const modal = (
    <div
      className={`modalOverlay ${styles.overlay}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Visualização ampliada da foto"
      style={{ zIndex: 2147483647, position: 'fixed', inset: 0 }}
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imageWrap}>
          <img src={src} alt={caption ? `Foto de ${caption}` : 'Foto ampliada'} className={styles.image} />
        </div>
        {caption ? <p className={styles.caption}>{caption}</p> : null}
        <p className={styles.hint}>Clique fora da imagem ou pressione Esc para fechar.</p>
        <button type="button" className={`modalBtnSecondary ${styles.closeBtn}`} onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );

  return createPortal(modal, portalTarget);
}
