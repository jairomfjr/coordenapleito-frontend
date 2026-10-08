/** Modal de loading (mesmo visual do PageLoading) na aba em branco do PDF. */
export function renderPdfLoadingDocument(doc: Document, pageTitle: string): void {
  const safeTitle = pageTitle.replace(/[<>&"]/g, '');

  doc.open();
  doc.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      min-height: 100%;
      background: #ffffff;
      font-family: 'Kanit', 'Segoe UI', system-ui, sans-serif;
    }
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      animation: fadeIn 0.25s ease-out;
    }
    .modal {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-radius: 24px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      padding: 2rem 2.5rem;
      max-width: 360px;
      width: 100%;
      text-align: center;
      animation: slideIn 0.28s ease-out;
    }
    .spinner {
      width: 3rem;
      height: 3rem;
      border: 3px solid #e2e8f0;
      border-top-color: #317042;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    .title {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: #0f172a;
    }
    .subtitle {
      margin: 0;
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.45;
    }
    .preview {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .previewLine {
      height: 0.55rem;
      border-radius: 6px;
      background: linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%);
      background-size: 200% 100%;
      animation: shimmer 1.2s ease-in-out infinite;
    }
    .previewLine:nth-child(1) { width: 100%; }
    .previewLine:nth-child(2) { width: 82%; animation-delay: 0.08s; }
    .previewLine:nth-child(3) { width: 64%; animation-delay: 0.16s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  </style>
</head>
<body>
  <div class="overlay" role="alertdialog" aria-live="assertive" aria-busy="true">
    <div class="modal">
      <div class="spinner" aria-hidden="true"></div>
      <p class="title">Gerando relatório</p>
      <p class="subtitle">Montando o PDF no servidor. Isso pode levar alguns instantes.</p>
      <div class="preview" aria-hidden="true">
        <div class="previewLine"></div>
        <div class="previewLine"></div>
        <div class="previewLine"></div>
      </div>
    </div>
  </div>
</body>
</html>`);
  doc.close();
}
