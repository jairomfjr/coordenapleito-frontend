'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { drawCircularCropFromVideo, getFaceGuideCircleInVideoSpace } from '@/lib/videoFrameCrop';
import styles from './CameraCaptureModal.module.css';

export interface CameraCaptureModalProps {
  open: boolean;
  onClose: () => void;
  /** Chamado com JPEG após capturar o quadro atual do vídeo. */
  onCapture: (file: File) => void;
  /** Título do modal (acessibilidade). */
  title?: string;
}

type CameraFacing = 'user' | 'environment';

/**
 * Modal que acessa a câmera (getUserMedia), exibe pré-visualização e captura um quadro em JPEG.
 * Requer contexto seguro (HTTPS ou localhost) e permissão do usuário.
 */
export function CameraCaptureModal({
  open,
  onClose,
  onCapture,
  title = 'Capturar foto com a câmera',
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoStageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<CameraFacing>('user');
  /** Incrementado em "Tentar novamente" para reexecutar getUserMedia sem mudar facingMode. */
  const [sessionKey, setSessionKey] = useState(0);

  const pararCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!open) {
      pararCamera();
      setStatus('idle');
      setErrorMessage(null);
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('error');
      setErrorMessage(
        'Este navegador não suporta acesso à câmera ou a página não está em HTTPS (exceto localhost).'
      );
      return;
    }

    let cancelado = false;
    setStatus('loading');
    setErrorMessage(null);
    pararCamera();

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelado) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();
        if (!cancelado) {
          setStatus('ready');
        }
      } catch (e) {
        if (cancelado) return;
        pararCamera();
        setStatus('error');
        const name = e instanceof Error ? e.name : '';
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setErrorMessage('Permissão da câmera negada. Permita o acesso nas configurações do navegador.');
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          setErrorMessage('Nenhuma câmera foi encontrada neste dispositivo.');
        } else {
          setErrorMessage('Não foi possível iniciar a câmera. Tente outro navegador ou dispositivo.');
        }
      }
    })();

    return () => {
      cancelado = true;
      pararCamera();
    };
  }, [open, facingMode, sessionKey, pararCamera]);

  const trocarCamera = () => {
    setFacingMode((f) => (f === 'user' ? 'environment' : 'user'));
  };

  const capturar = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const stage = videoStageRef.current;
    if (!video || !canvas || !stage || video.readyState < 2) {
      return;
    }
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    const { width: cw, height: ch } = stage.getBoundingClientRect();
    if (cw < 8 || ch < 8) return;

    /** Mesma elipse do gabarito (.faceGuide), mapeada do preview para o bitmap do vídeo. */
    const { cx, cy, r } = getFaceGuideCircleInVideoSpace(vw, vh, cw, ch);
    if (!drawCircularCropFromVideo(canvas, video, cx, cy, r)) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], 'foto-camera.jpg', { type: 'image/jpeg' });
        pararCamera();
        onCapture(file);
        onClose();
      },
      'image/jpeg',
      0.92
    );
  };

  const tentarNovamente = () => {
    setErrorMessage(null);
    setSessionKey((k) => k + 1);
  };

  if (!open) return null;

  const modal = (
    <div
      className={`modalOverlay ${styles.overlay}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-capture-title"
    >
      <div className={`modalContent ${styles.content}`}>
        <h2 id="camera-capture-title" style={{ margin: '0 0 0.75rem', fontSize: '1.125rem', fontWeight: 600 }}>
          {title}
        </h2>
        <p className={styles.message}>
          Use o gabarito: centralize o rosto na elipse tracejada e mantenha o busto visível dentro da moldura.
          A foto será recortada nesse quadro 4×3.
        </p>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <div className={styles.videoWrap} ref={videoStageRef}>
          <video ref={videoRef} className={styles.video} playsInline muted autoPlay />
          {status === 'ready' && (
            <div className={styles.guideOverlay} aria-hidden>
              <div className={styles.guideCorners} />
              <div className={styles.faceGuide} />
              <p className={styles.guideLabel}>Rosto na elipse · olhos na linha média</p>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className={styles.hiddenCanvas} aria-hidden />
        <div className={styles.actionsPrimary}>
          {status === 'loading' && <span className={styles.spinner}>Iniciando câmera…</span>}
          {status === 'ready' && (
            <>
              <button type="button" className="modalBtnPrimary" onClick={capturar}>
                Capturar foto
              </button>
              <button type="button" className="modalBtnSecondary" onClick={trocarCamera}>
                Trocar câmera
              </button>
            </>
          )}
          {status === 'error' && (
            <button type="button" className="modalBtnPrimary" onClick={tentarNovamente}>
              Tentar novamente
            </button>
          )}
        </div>
        <div className={styles.actions} style={{ marginTop: '1rem' }}>
          <button type="button" className="modalBtnSecondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modal, document.body);
  }
  return null;
}
