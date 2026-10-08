/**
 * Região do quadro de vídeo visível com object-fit: cover num retângulo cw×ch.
 * Coordenadas em pixels do bitmap de origem (videoWidth × videoHeight).
 */
export function getCoverCropSourceRect(
  videoWidth: number,
  videoHeight: number,
  containerWidth: number,
  containerHeight: number
): { sx: number; sy: number; sw: number; sh: number } {
  const scale = Math.max(containerWidth / videoWidth, containerHeight / videoHeight);
  const sw = containerWidth / scale;
  const sh = containerHeight / scale;
  const sx = (videoWidth - sw) / 2;
  const sy = (videoHeight - sh) / 2;
  return { sx, sy, sw, sh };
}

/**
 * Recorte central com proporção fixa (ex. 4×3) no bitmap do vídeo.
 * Equivale a object-fit: cover num retângulo com essa proporção, centrado.
 * Use isto na captura da câmera: se o preview tiver a mesma proporção do stream
 * (ex. 16:9), getCoverCropSourceRect pelo DOM devolve o quadro inteiro — aqui sempre cortamos.
 */
export function getCenterFixedAspectCropRect(
  videoWidth: number,
  videoHeight: number,
  aspectW: number,
  aspectH: number
): { sx: number; sy: number; sw: number; sh: number } {
  const targetRatio = aspectW / aspectH;
  const srcRatio = videoWidth / videoHeight;
  if (srcRatio > targetRatio) {
    const sh = videoHeight;
    const sw = sh * targetRatio;
    return { sx: (videoWidth - sw) / 2, sy: 0, sw, sh };
  }
  const sw = videoWidth;
  const sh = sw / targetRatio;
  return { sx: 0, sy: (videoHeight - sh) / 2, sw, sh };
}

/** Mesmos valores que `.faceGuide` em `CameraCaptureModal.module.css` (centralizar rosto na elipse). */
export const FACE_GUIDE_LAYOUT = {
  centerXFrac: 0.5,
  centerYFrac: 0.38,
  widthFrac: 0.58,
  maxWidthPx: 200,
} as const;

/**
 * Centro e raio do círculo do gabarito em coordenadas do bitmap do vídeo,
 * alinhado ao que aparece no preview (object-fit: cover no stage cw×ch).
 */
export function getFaceGuideCircleInVideoSpace(
  videoWidth: number,
  videoHeight: number,
  stageWidth: number,
  stageHeight: number
): { cx: number; cy: number; r: number } {
  const vis = getCoverCropSourceRect(videoWidth, videoHeight, stageWidth, stageHeight);
  const cw = stageWidth;
  const ch = stageHeight;
  const W = Math.min(FACE_GUIDE_LAYOUT.widthFrac * cw, FACE_GUIDE_LAYOUT.maxWidthPx);
  const r = (W / 2) * (vis.sw / cw);
  const cx = vis.sx + FACE_GUIDE_LAYOUT.centerXFrac * vis.sw;
  const cy = vis.sy + FACE_GUIDE_LAYOUT.centerYFrac * vis.sh;
  return { cx, cy, r };
}

/**
 * Desenha no canvas um quadrado 2r×2r com recorte circular do vídeo (resto branco — JPEG).
 */
export function drawCircularCropFromVideo(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  cx: number,
  cy: number,
  r: number
): boolean {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh || r <= 0) return false;

  const S = 2 * r;
  const left = cx - r;
  const top = cy - r;
  const w = Math.max(1, Math.round(S));
  const h = w;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
  ctx.clip();

  const sx0 = Math.max(0, left);
  const sy0 = Math.max(0, top);
  const sx1 = Math.min(vw, left + S);
  const sy1 = Math.min(vh, top + S);
  const srcW = sx1 - sx0;
  const srcH = sy1 - sy0;
  if (srcW > 0 && srcH > 0) {
    const dx0 = sx0 - left;
    const dy0 = sy0 - top;
    ctx.drawImage(video, sx0, sy0, srcW, srcH, dx0, dy0, srcW, srcH);
  }
  ctx.restore();
  return true;
}
