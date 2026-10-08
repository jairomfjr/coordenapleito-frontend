import { getAppBasePath } from '@/lib/app-base-path';
import { renderPdfLoadingDocument } from '@/lib/pdfLoadingDocument';
import { isFirefox } from '@/lib/isFirefox';
import {
  PDF_VIEWER_OPEN,
  PDF_VIEWER_READY,
} from '@/lib/relatorioPdfViewerMessage';

export class RelatorioPdfPopupBlockedError extends Error {
  constructor() {
    super('Pop-up bloqueado. Permita pop-ups para este site e tente novamente.');
    this.name = 'RelatorioPdfPopupBlockedError';
  }
}

function waitViewerReady(janela: Window, timeoutMs = 30_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      window.removeEventListener('message', handler);
      reject(new Error('Visualizador de PDF não respondeu a tempo.'));
    }, timeoutMs);

    const handler = (event: MessageEvent) => {
      if (event.source !== janela || event.origin !== window.location.origin) {
        return;
      }
      if (event.data?.type === PDF_VIEWER_READY) {
        window.clearTimeout(timeout);
        window.removeEventListener('message', handler);
        resolve();
      }
    };

    window.addEventListener('message', handler);
  });
}

async function publicarPdfParaVisualizacaoChrome(blob: Blob, filename: string): Promise<string> {
  const safeFilename = filename.replace(/[/\\]/g, '_');
  const base = getAppBasePath();
  const response = await fetch(`${base}/api/relatorios/pdf-view`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/pdf',
      'X-Relatorio-Filename': encodeURIComponent(safeFilename),
    },
    body: blob,
  });

  if (!response.ok) {
    throw new Error('Falha ao publicar PDF para visualização.');
  }

  const payload = (await response.json()) as { id?: string };
  if (!payload.id) {
    throw new Error('Resposta inválida ao publicar PDF.');
  }

  return `${base}/api/relatorios/pdf-view/${payload.id}`;
}

/**
 * Abre o PDF em nova aba.
 * Chrome/Edge: URL HTTP com Content-Disposition (visualizador nativo + download com nome).
 * Firefox: página interna com PDF.js.
 */
export async function openRelatorioPdfPopup(
  filename: string,
  carregarPdf: () => Promise<Blob>,
): Promise<void> {
  const firefox = isFirefox();

  let janela: Window | null;
  let viewerReady: Promise<void> | null = null;

  if (firefox) {
    janela = window.open('/relatorios/visualizador-pdf', '_blank');
    if (!janela) {
      throw new RelatorioPdfPopupBlockedError();
    }
    viewerReady = waitViewerReady(janela);
  } else {
    janela = window.open('about:blank', '_blank');
    if (!janela) {
      throw new RelatorioPdfPopupBlockedError();
    }
    renderPdfLoadingDocument(janela.document, filename);
  }

  try {
    const data = await carregarPdf();
    const blob = data.type === 'application/pdf' ? data : new Blob([data], { type: 'application/pdf' });
    if (!blob.size) {
      janela.close();
      throw new Error('PDF vazio.');
    }

    if (firefox) {
      await viewerReady;
      const buffer = await blob.arrayBuffer();
      janela.postMessage(
        { type: PDF_VIEWER_OPEN, filename, buffer },
        window.location.origin,
        [buffer],
      );
      return;
    }

    const viewUrl = await publicarPdfParaVisualizacaoChrome(blob, filename);
    janela.location.href = viewUrl;
  } catch (error) {
    janela.close();
    if (error instanceof RelatorioPdfPopupBlockedError) {
      throw error;
    }
    if (error instanceof Error && error.message === 'PDF vazio.') {
      throw error;
    }
    throw new Error('Não foi possível gerar o PDF.');
  }
}
