'use client';

import { useEffect } from 'react';

function textoBotao(btn: HTMLButtonElement): string {
  return (btn.textContent ?? '').trim().toLowerCase();
}

function ehBotaoFechamento(btn: HTMLButtonElement): boolean {
  const texto = textoBotao(btn);
  return (
    btn.hasAttribute('data-modal-close') ||
    btn.classList.contains('btnFechar') ||
    btn.classList.contains('modalBtnSecondary') ||
    btn.getAttribute('aria-label')?.toLowerCase().includes('fechar') === true ||
    btn.getAttribute('title')?.toLowerCase().includes('fechar') === true ||
    texto === 'fechar' ||
    texto === 'voltar' ||
    texto === 'cancelar'
  );
}

function tryCloseModal(modal: HTMLElement, sourceButton: HTMLButtonElement) {
  const allCandidates = Array.from(modal.querySelectorAll<HTMLButtonElement>('button'));
    const sameModalCandidates = allCandidates.filter(
      (btn) =>
        btn !== sourceButton &&
        !btn.disabled &&
        btn.closest('.modalContent') === modal &&
        ehBotaoFechamento(btn)
    );

  const prioridade = (btn: HTMLButtonElement): number => {
    const texto = textoBotao(btn);
    if (btn.hasAttribute('data-modal-close')) return 0;
    if (btn.classList.contains('btnFechar') || texto === 'fechar') return 1;
    if (btn.getAttribute('aria-label')?.toLowerCase().includes('fechar')) return 2;
    if (btn.getAttribute('title')?.toLowerCase().includes('fechar')) return 3;
    if (btn.classList.contains('modalBtnSecondary') && texto === 'fechar') return 4;
    if (texto === 'voltar') return 5;
    if (texto === 'cancelar') return 6;
    return 99;
  };

  const ordenados = sameModalCandidates.sort((a, b) => prioridade(a) - prioridade(b));
  const target = ordenados[0];
  if (target) {
    target.click();
    return;
  }

  const overlay = modal.closest('.modalOverlay') as HTMLElement | null;
  if (overlay) {
    overlay.click();
    return;
  }

  // Fallback: tenta fechar por ESC (quando houver handler global)
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

function ensureCloseButton(modal: HTMLElement) {
  /** Atributo no próprio `.modalContent` (querySelector não inclui o raiz). */
  if (modal.hasAttribute('data-modal-top-close')) {
    modal.querySelectorAll('.modalGlobalCloseBtn').forEach((b) => b.remove());
    return;
  }
  if (modal.querySelector('[data-modal-top-close]')) {
    modal.querySelectorAll('.modalGlobalCloseBtn').forEach((b) => b.remove());
    return;
  }
  if (modal.querySelector('.modalGlobalCloseBtn')) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'modalGlobalCloseBtn';
  button.setAttribute('aria-label', 'Fechar modal');
  button.setAttribute('title', 'Fechar');
  button.innerHTML =
    "<svg viewBox='0 0 24 24' width='16' height='16' aria-hidden='true' focusable='false'><path d='M6 6l12 12M18 6L6 18' fill='none' stroke='currentColor' stroke-width='2.25' stroke-linecap='round'/></svg>";

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    tryCloseModal(modal, button);
  });

  modal.appendChild(button);
}

export default function GlobalModalCloseButtonManager() {
  useEffect(() => {
    const scan = () => {
      const modais = Array.from(document.querySelectorAll<HTMLElement>('.modalContent'));
      for (const modal of modais) {
        ensureCloseButton(modal);
      }
    };

    scan();
    const observer = new MutationObserver(() => scan());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
