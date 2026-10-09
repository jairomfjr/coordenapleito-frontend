/**
 * Exporta a árvore do organograma para PDF usando html2canvas + jsPDF.
 *
 * Gradientes/pseudo-elementos costumam gerar falhas no html2canvas (`createPattern`);
 * neutralizamos isso por CSS injetado no clone.
 */
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const EXPORT_DATA_ATTR = 'data-organogram-export';
/** Faixa superior institucional na captura (PDF/PNG). */
export const EXPORT_ORGANOGRAM_HEADER_PX = 52;
const EXPORT_HEADER_BG = '#2d5a27';

function criarTopoExportInstitucional(larguraPx: number): HTMLDivElement {
  const header = document.createElement('div');
  header.setAttribute('data-hub-org-export-header', '1');
  header.style.boxSizing = 'border-box';
  header.style.flexShrink = '0';
  header.style.width = `${larguraPx}px`;
  header.style.minHeight = `${EXPORT_ORGANOGRAM_HEADER_PX}px`;
  header.style.height = `${EXPORT_ORGANOGRAM_HEADER_PX}px`;
  header.style.background = EXPORT_HEADER_BG;
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.paddingLeft = '18px';
  header.style.paddingRight = '18px';
  header.style.gap = '14px';
  header.style.fontFamily = 'Kanit, sans-serif';

  const marca = document.createElement('span');
  marca.textContent = 'Coordenapleito';
  marca.style.color = '#ffffff';
  marca.style.fontWeight = '800';
  marca.style.fontSize = '22px';
  marca.style.lineHeight = '1';
  marca.style.letterSpacing = '-0.02em';

  const subtitulo = document.createElement('span');
  subtitulo.textContent = 'COORDENAPLEITO';
  subtitulo.style.color = '#ffffff';
  subtitulo.style.fontWeight = '600';
  subtitulo.style.fontSize = '11px';
  subtitulo.style.lineHeight = '1.2';
  subtitulo.style.letterSpacing = '0.06em';
  subtitulo.style.textTransform = 'none';
  subtitulo.style.opacity = '0.98';
  subtitulo.style.whiteSpace = 'nowrap';
  subtitulo.style.overflow = 'hidden';
  subtitulo.style.textOverflow = 'ellipsis';

  header.appendChild(marca);
  header.appendChild(subtitulo);
  return header;
}

function injectNeutralizationStyles(doc: Document, nivel: 'completo' | 'minimal'): void {
  const id = 'hub-organogram-export-css';
  if (doc.getElementById(id)) return;
  const style = doc.createElement('style');
  style.id = id;
  /* Class names vêm de CSS Modules (hash); usamos substrings [class*="…"] no clone. */
  const base = `
    [${EXPORT_DATA_ATTR}] * {
      box-shadow: none !important;
      filter: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      text-shadow: none !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="treeNodeItem"]::before,
    [${EXPORT_DATA_ATTR}] [class*="treeNodeItem"]::after {
      background-image: none !important;
      background: #2c3d5a !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="treeNodeItem"] > [class*="treeList"]::before {
      background-image: none !important;
      background: #2c3d5a !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="treeList"] > [class*="treeNodeItem"]:not(:only-child) {
      background-image: linear-gradient(#2c3d5a, #2c3d5a) !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="institutionalHBridge"]::before,
    [${EXPORT_DATA_ATTR}] [class*="institutionalSpine"]::before,
    [${EXPORT_DATA_ATTR}] [class*="institutionalBottom"]::before,
    [${EXPORT_DATA_ATTR}] [class*="institutionalBottom"] [class*="institutionalCardWrap"]::before {
      background-image: none !important;
      background: #2c3d5a !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="treeCard"]::before {
      background-image: none !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="treeCardStripePai"]::before {
      background: linear-gradient(90deg, #059669 0%, #10b981 42%, #34d399 100%) !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="treeCardStripeFilho"]::before {
      background: linear-gradient(90deg, #1d4ed8 0%, #2563eb 38%, #3b82f6 72%, #60a5fa 100%) !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="treeCard"]::after {
      display: none !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="treeAvatar"] {
      background-image: none !important;
      background-color: #dbeafe !important;
    }
    [${EXPORT_DATA_ATTR}] img {
      filter: none !important;
      image-rendering: auto !important;
    }
  `;
  /** Layout mais denso só na captura PDF/PNG: mais cards por linha na mesma página. */
  const exportCompactLayout = `
    [${EXPORT_DATA_ATTR}] [class*="treeCanvas"] {
      --tree-card-width: 166px !important;
      --tree-card-min-width: 138px !important;
      --tree-card-max-width: 166px !important;
      --tree-card-min-height: 86px !important;
      --tree-conn-gap-parent: 0.32rem !important;
      --tree-conn-rail-top: 0.36rem !important;
      --tree-conn-stem-down: 0.38rem !important;
      --tree-conn-gap-card: 0.28rem !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="treeCardBody"] {
      grid-template-columns: 32px minmax(0, 1fr) !important;
      gap: 0.34rem !important;
      padding: 0.34rem 0.42rem 0.32rem !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="treeAvatar"] {
      width: 32px !important;
      height: 32px !important;
      font-size: 0.62rem !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="treeNodeName"] {
      font-size: 0.7rem !important;
      line-height: 1.2 !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="treeNodeRole"] {
      font-size: 0.6rem !important;
      line-height: 1.22 !important;
      -webkit-line-clamp: 4 !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="treeNodeItem"] > [class*="treeList"] {
      margin-top: var(--tree-conn-gap-parent, 0.32rem) !important;
      padding-top: 0 !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="institutionalWrap"] {
      max-width: none !important;
      gap: 0.34rem !important;
      padding: 0.08rem 0.28rem 0.2rem !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="institutionalMid"] {
      grid-template-columns: minmax(124px, 148px) 8px minmax(124px, 148px) !important;
      column-gap: 0.28rem !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="institutionalBottom"] {
      grid-auto-columns: 158px !important;
      gap: 0.28rem !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="institutionalCard"] {
      width: 158px !important;
      min-width: 126px !important;
      max-width: 158px !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="institutionalCol"] [class*="institutionalCardWrap"] {
      max-width: 158px !important;
    }
    [${EXPORT_DATA_ATTR}] [class*="institutionalCol"] [class*="treeCardBody"] {
      min-height: 68px !important;
      padding-top: 0.16rem !important;
      padding-bottom: 0.16rem !important;
    }
  `;
  const extra =
    nivel === 'completo'
      ? `
    [${EXPORT_DATA_ATTR}] * {
      animation: none !important;
      transition: none !important;
    }
  `
      : '';

  style.textContent = `${base}\n${exportCompactLayout}\n${extra}`;
  doc.head.appendChild(style);
}

function sanitizeCloneImages(clonedRoot: HTMLElement): void {
  clonedRoot.querySelectorAll('img').forEach((node) => {
    const img = node as HTMLImageElement;
    if (!img.complete || (img.naturalWidth === 0 && img.naturalHeight === 0)) {
      img.removeAttribute('src');
      img.alt = '';
      img.style.opacity = '0';
      img.style.width = '0';
      img.style.height = '0';
    }
  });
}

async function esperarImagensDoClone(
  clonedRoot: HTMLElement,
  timeoutMs: number = 4000,
): Promise<void> {
  const imagens = Array.from(clonedRoot.querySelectorAll('img')) as HTMLImageElement[];
  if (imagens.length === 0) return;

  await Promise.all(
    imagens.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }

          let done = false;
          const finalizar = () => {
            if (done) return;
            done = true;
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
            resolve();
          };
          const onLoad = () => finalizar();
          const onError = () => finalizar();

          img.addEventListener('load', onLoad, { once: true });
          img.addEventListener('error', onError, { once: true });

          // força priorização de decode/render no clone para o html2canvas
          img.loading = 'eager';
          img.decoding = 'sync';
          window.setTimeout(finalizar, timeoutMs);
        }),
    ),
  );
}

async function esperarFontesElayout(): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignora ambientes estranhos */
    }
  }
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

type CaptureOpts = {
  largura: number;
  /** Altura só da árvore (sem o topo). */
  alturaArvore: number;
  headerHeightPx: number;
  scale: number;
  incluirMidias: boolean;
  cssNeutral: 'minimal' | 'completo';
};

async function captureUma(
  elementoAlvo: HTMLElement,
  opts: CaptureOpts,
): Promise<HTMLCanvasElement> {
  await esperarFontesElayout();

  const { largura, alturaArvore, headerHeightPx, scale, incluirMidias, cssNeutral } = opts;
  const alturaTotal = headerHeightPx + alturaArvore;

  const wrapper = document.createElement('div');
  wrapper.setAttribute(EXPORT_DATA_ATTR, '1');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-99999px';
  wrapper.style.top = '0';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.width = `${largura}px`;
  wrapper.style.height = `${alturaTotal}px`;
  wrapper.style.background = '#ffffff';
  wrapper.style.overflow = 'hidden';
  wrapper.style.zIndex = '-1';

  const topo = criarTopoExportInstitucional(largura);
  topo.style.height = `${headerHeightPx}px`;
  topo.style.minHeight = `${headerHeightPx}px`;

  const clone = elementoAlvo.cloneNode(true) as HTMLElement;
  clone.style.width = `${largura}px`;
  clone.style.height = `${alturaArvore}px`;
  clone.style.flexShrink = '0';
  clone.style.overflow = 'hidden';
  clone.style.margin = '0';

  if (!incluirMidias) {
    clone.querySelectorAll('canvas,svg,video').forEach((el) => el.remove());
    clone.querySelectorAll('img').forEach((el) => el.remove());
  } else {
    await esperarImagensDoClone(clone);
    sanitizeCloneImages(clone);
  }

  wrapper.appendChild(topo);
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const canvas = await html2canvas(wrapper, {
      scale,
      useCORS: true,
      allowTaint: false,
      foreignObjectRendering: false,
      backgroundColor: '#ffffff',
      width: largura,
      height: alturaTotal,
      imageTimeout: 20000,
      logging: false,
      onclone: (doc) => {
        injectNeutralizationStyles(doc, cssNeutral);
        const clonedWrapper = doc.querySelector(
          `[${EXPORT_DATA_ATTR}="1"]`,
        ) as HTMLElement | null;
        if (clonedWrapper) {
          if (!incluirMidias) {
            clonedWrapper.querySelectorAll('img,canvas,svg,video').forEach((node) =>
              node.remove(),
            );
          } else {
            sanitizeCloneImages(clonedWrapper);
          }
        }
      },
    });

    if (canvas.width <= 1 || canvas.height <= 1) {
      throw new Error('Captura gerou canvas com dimensões inválidas.');
    }
    return canvas;
  } finally {
    document.body.removeChild(wrapper);
  }
}

function montarPdfPaisagem(
  canvas: HTMLCanvasElement,
  nomeArquivo: string,
  pageScaleFactor: number = 1,
  pageFormat: 'a4' | 'a3' = 'a4',
): void {
  const canvasAjustado = recortarCanvasParaConteudo(canvas);
  const png = canvasAjustado.toDataURL('image/png');

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: pageFormat });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  /** Centraliza na horizontal e encosta ao topo (evita grande faixa branca acima da captura). */
  const marginSideMm = 8;
  const marginTopMm = 5;
  const marginBottomMm = 12;
  const usableWidth = pageWidth - marginSideMm * 2;
  const usableHeight = pageHeight - marginTopMm - marginBottomMm;

  const sx = usableWidth / canvasAjustado.width;
  const sy = usableHeight / canvasAjustado.height;
  const fator = Math.max(0.1, Math.min(1, pageScaleFactor));
  const k = Math.min(sx, sy) * fator;
  const renderWidth = canvasAjustado.width * k;
  const renderHeight = canvasAjustado.height * k;
  const x = marginSideMm + (usableWidth - renderWidth) / 2;
  const y = marginTopMm;

  pdf.addImage(png, 'PNG', x, y, renderWidth, renderHeight, undefined, 'FAST');
  pdf.save(nomeArquivo);
}

function baixarPng(canvas: HTMLCanvasElement, nomeArquivo: string): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('PNG indisponível.'));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomeArquivo;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        resolve();
      },
      'image/png',
      0.95,
    );
  });
}

function recortarCanvasParaConteudo(origem: HTMLCanvasElement): HTMLCanvasElement {
  const w = origem.width;
  const h = origem.height;
  if (w <= 2 || h <= 2) return origem;

  const ctx = origem.getContext('2d', { willReadFrequently: true });
  if (!ctx) return origem;
  const { data } = ctx.getImageData(0, 0, w, h);

  let minX = w;
  let maxX = -1;
  const brancoLimite = 246;
  // Ignora a faixa superior institucional (header verde), que ocupa toda a largura e distorce o recorte.
  const inicioBuscaY = Math.min(h - 1, 140);

  for (let y = inicioBuscaY; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      const ehBranco = r >= brancoLimite && g >= brancoLimite && b >= brancoLimite;
      if (a > 0 && !ehBranco) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }

  if (maxX < minX) return origem;

  const margem = 6;
  const sx = Math.max(0, minX - margem);
  const ex = Math.min(w - 1, maxX + margem);
  const nw = ex - sx + 1;
  const nh = h;
  if (nw <= 2 || nh <= 2) return origem;

  const novo = document.createElement('canvas');
  novo.width = nw;
  novo.height = nh;
  const nctx = novo.getContext('2d');
  if (!nctx) return origem;
  nctx.fillStyle = '#ffffff';
  nctx.fillRect(0, 0, nw, nh);
  nctx.drawImage(origem, sx, 0, nw, nh, 0, 0, nw, nh);
  return novo;
}

export type ExportOrganogramaTreeResult =
  | { formato: 'pdf'; avisoImagensAusentes?: boolean }
  | { formato: 'png'; motivoFallback: string };

export type ExportOrganogramaLoteItem = {
  elementoAlvo: HTMLElement;
  tituloPagina?: string;
  /** Escala adicional (0 < fator <= 1) para reduzir uma página específica no PDF. */
  scaleFactor?: number;
};

export function medirParaExport(alvo: HTMLElement): { largura: number; altura: number } {
  const largura = Math.max(1, alvo.scrollWidth || alvo.clientWidth || alvo.offsetWidth || 1);
  const altura = Math.max(
    1,
    alvo.scrollHeight || alvo.clientHeight || alvo.offsetHeight || 1,
  );
  return {
    largura: Math.ceil(largura),
    altura: Math.ceil(altura),
  };
}

/** Tenta capturar e gerar PDF; se o arquivo PDF falhar, baixa PNG do mesmo quadro capturado. */
export async function exportOrganogramaTreePdf(
  elementoAlvo: HTMLElement,
  opcoes?: {
    arquivoPdf?: string;
    arquivoPng?: string;
    headerHeightPx?: number;
    pageScaleFactor?: number;
    pageFormat?: 'a4' | 'a3';
  },
): Promise<ExportOrganogramaTreeResult> {
  const { largura, altura: alturaArvore } = medirParaExport(elementoAlvo);
  if (largura <= 2 || alturaArvore <= 2) {
    throw new Error('Área da árvore invisível ou ainda não medida pelo layout.');
  }

  const headerHeightPx = opcoes?.headerHeightPx ?? EXPORT_ORGANOGRAM_HEADER_PX;

  const pdfName = opcoes?.arquivoPdf ?? 'organograma-horizontal.pdf';
  const pngName = opcoes?.arquivoPng ?? 'organograma-arvore.png';

  const tentativas: CaptureOpts[] = [
    {
      largura,
      alturaArvore,
      headerHeightPx,
      scale: 2,
      incluirMidias: true,
      cssNeutral: 'minimal',
    },
    {
      largura,
      alturaArvore,
      headerHeightPx,
      scale: 2,
      incluirMidias: true,
      cssNeutral: 'completo',
    },
    {
      largura,
      alturaArvore,
      headerHeightPx,
      scale: 2,
      incluirMidias: false,
      cssNeutral: 'completo',
    },
    {
      largura,
      alturaArvore,
      headerHeightPx,
      scale: 1,
      incluirMidias: false,
      cssNeutral: 'completo',
    },
  ];

  let ultimoErroCapture: unknown;

  for (const opts of tentativas) {
    try {
      const canvas = await captureUma(elementoAlvo, opts);
      try {
        montarPdfPaisagem(
          canvas,
          pdfName,
          opcoes?.pageScaleFactor ?? 1,
          opcoes?.pageFormat ?? 'a4',
        );
        return {
          formato: 'pdf',
          avisoImagensAusentes: !opts.incluirMidias,
        };
      } catch (pdfErro) {
        console.warn('[exportOrganogramaTreePdf] PDF falhou após captura; tentando PNG.', pdfErro);
        try {
          await baixarPng(canvas, pngName);
          return {
            formato: 'png',
            motivoFallback:
              'O arquivo PDF não pôde ser montado; uma imagem PNG equivalente foi salva.',
          };
        } catch {
          /* próxima estratégia de captura */
        }
      }
    } catch (e) {
      ultimoErroCapture = e;
    }
  }

  console.error('[exportOrganogramaTreePdf] Falha ao capturar.', ultimoErroCapture);
  throw ultimoErroCapture instanceof Error
    ? ultimoErroCapture
    : new Error('Falha ao exportar o organograma.');
}

export async function exportOrganogramaTabsPdf(
  itens: ExportOrganogramaLoteItem[],
  opcoes?: { arquivoPdf?: string; headerHeightPx?: number },
): Promise<{ formato: 'pdf'; avisoImagensAusentes?: boolean }> {
  const validos = itens.filter((i) => i?.elementoAlvo);
  if (validos.length === 0) {
    throw new Error('Nenhuma aba válida foi informada para exportação.');
  }

  const arquivoPdf = opcoes?.arquivoPdf ?? 'organograma-abas.pdf';
  const headerHeightPx = opcoes?.headerHeightPx ?? EXPORT_ORGANOGRAM_HEADER_PX;

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  let addedPages = 0;
  let houveFallbackSemMidia = false;

  for (const item of validos) {
    const { largura, altura: alturaArvore } = medirParaExport(item.elementoAlvo);
    if (largura <= 2 || alturaArvore <= 2) continue;

    const tentativas: CaptureOpts[] = [
      { largura, alturaArvore, headerHeightPx, scale: 2, incluirMidias: true, cssNeutral: 'minimal' },
      { largura, alturaArvore, headerHeightPx, scale: 2, incluirMidias: true, cssNeutral: 'completo' },
      { largura, alturaArvore, headerHeightPx, scale: 2, incluirMidias: false, cssNeutral: 'completo' },
      { largura, alturaArvore, headerHeightPx, scale: 1, incluirMidias: false, cssNeutral: 'completo' },
    ];

    let canvasCapturado: HTMLCanvasElement | null = null;
    let usouMidia = true;
    let ultimoErro: unknown;

    for (const opts of tentativas) {
      try {
        canvasCapturado = await captureUma(item.elementoAlvo, opts);
        usouMidia = opts.incluirMidias;
        break;
      } catch (err) {
        ultimoErro = err;
      }
    }

    if (!canvasCapturado) {
      throw ultimoErro instanceof Error ? ultimoErro : new Error('Falha ao capturar uma das abas.');
    }

    if (!usouMidia) {
      houveFallbackSemMidia = true;
    }

    if (addedPages > 0) {
      pdf.addPage();
    }

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginSideMm = 8;
    const marginTopMm = 5;
    const marginBottomMm = 12;
    const usableWidth = pageWidth - marginSideMm * 2;
    const usableHeight = pageHeight - marginTopMm - marginBottomMm;

    const canvasAjustado = recortarCanvasParaConteudo(canvasCapturado);
    const sx = usableWidth / canvasAjustado.width;
    const sy = usableHeight / canvasAjustado.height;
    const fatorItem =
      typeof item.scaleFactor === 'number' && Number.isFinite(item.scaleFactor)
        ? Math.max(0.1, Math.min(1, item.scaleFactor))
        : 1;
    const k = Math.min(sx, sy) * fatorItem;
    const renderWidth = canvasAjustado.width * k;
    const renderHeight = canvasAjustado.height * k;
    const x = marginSideMm + (usableWidth - renderWidth) / 2;
    const y = marginTopMm;

    const png = canvasAjustado.toDataURL('image/png');
    pdf.addImage(png, 'PNG', x, y, renderWidth, renderHeight, undefined, 'FAST');
    addedPages += 1;
  }

  if (addedPages === 0) {
    throw new Error('Nenhuma aba tinha área visível para exportação.');
  }

  pdf.save(arquivoPdf);
  return { formato: 'pdf', avisoImagensAusentes: houveFallbackSemMidia };
}
