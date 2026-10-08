export type CropImageVerticalAlign = 'center' | 'top';

export type CropImageOptions = {
  /**
   * Em fotos retrato (imagem mais alta que a área 4×3), o recorte central corta a cabeça.
   * {@code 'top'} alinha pelo topo (prioriza rosto/cabeça), equivalente a object-fit: cover
   * com object-position: top center.
   */
  verticalAlign?: CropImageVerticalAlign;
};

/**
 * Recorta a imagem para a proporção indicada (ex.: 4×3),
 * equivalente a object-fit: cover; o alinhamento vertical é configurável.
 */
export async function cropImageToAspectRatio(
  file: File,
  aspectW: number,
  aspectH: number,
  options?: CropImageOptions
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    const w = bitmap.width;
    const h = bitmap.height;
    const targetRatio = aspectW / aspectH;
    const srcRatio = w / h;
    let sx: number;
    let sy: number;
    let sw: number;
    let sh: number;
    if (srcRatio > targetRatio) {
      sh = h;
      sw = h * targetRatio;
      sx = (w - sw) / 2;
      sy = 0;
    } else {
      sw = w;
      sh = w / targetRatio;
      sx = 0;
      sy = options?.verticalAlign === 'top' ? 0 : (h - sh) / 2;
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D não disponível.');
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    const type =
      file.type === 'image/png'
        ? 'image/png'
        : file.type === 'image/webp'
          ? 'image/webp'
          : 'image/jpeg';
    const quality = type === 'image/jpeg' || type === 'image/webp' ? 0.92 : undefined;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), type, quality)
    );
    if (!blob) throw new Error('Falha ao gerar imagem.');
    const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
    return new File([blob], `foto.${ext}`, { type });
  } finally {
    bitmap.close();
  }
}
