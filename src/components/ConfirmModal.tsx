'use client';

import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Desabilita ações e impede fechar enquanto a confirmação está em andamento. */
  confirmLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'neutral';
}

/** Evita fechar no mesmo clique que abriu o modal (overlay montado durante o evento). */
const OVERLAY_DISMISS_GRACE_MS = 400;

export function ConfirmModal({
  open,
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmLoading = false,
  onConfirm,
  onCancel,
  variant = 'neutral',
}: ConfirmModalProps) {
  const abriuEmRef = useRef(0);

  useEffect(() => {
    if (open) {
      abriuEmRef.current = performance.now();
    }
  }, [open]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (confirmLoading) return;
    if (e.target !== e.currentTarget) return;
    if (performance.now() - abriuEmRef.current < OVERLAY_DISMISS_GRACE_MS) return;
    onCancel();
  };

  return (
    <div
      className="modalOverlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
    >
      <div className="modalContent" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <h2 id="confirm-modal-title" style={{ margin: '0 0 0.75rem', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)' }}>
          {title}
        </h2>
        <p id="confirm-modal-desc" style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
          {message}
        </p>
        <div className="modalActions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="modalBtnSecondary"
            onClick={onCancel}
            disabled={confirmLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="modalBtnPrimary"
            onClick={onConfirm}
            disabled={confirmLoading}
            aria-busy={confirmLoading}
            style={variant === 'danger' ? { background: '#b91c1c', color: '#fff' } : undefined}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
