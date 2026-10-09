'use client';

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
 * Visualização ampliada da imagem (X no topo ou botão Fechar para sair).
 */
export function ImageLightboxModal({ open, onClose, src, caption }: ImageLightboxModalProps) {
  if (!open || !src || typeof document === 'undefined') return null;
  const portalTarget = (document.fullscreenElement as HTMLElement | null) ?? document.body;

  const modal = (
    <div
      className={`modalOverlay ${styles.overlay}`}
      role="dialog"
      aria-modal="true"
      aria-label="Visualização ampliada da foto"
      style={{ zIndex: 2147483647, position: 'fixed', inset: 0 }}
    >
      <button
        type="button"
        className="modalGlobalCloseBtn"
        aria-label="Fechar modal"
        title="Fechar"
        data-modal-close
        onClick={onClose}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
          <path
            d="M6 6l12 12M18 6L6 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <div className={styles.panel}>
        <div className={styles.imageWrap}>
          <img src={src} alt={caption ? `Foto de ${caption}` : 'Foto ampliada'} className={styles.image} />
        </div>
        {caption ? <p className={styles.caption}>{caption}</p> : null}
        <button type="button" className={`modalBtnSecondary ${styles.closeBtn}`} onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );

  return createPortal(modal, portalTarget);
}
