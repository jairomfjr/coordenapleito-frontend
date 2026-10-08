'use client';

import { useEffect } from 'react';

/** Senhas preservam maiúsculas/minúsculas (inclusive quando type="text" ao exibir a senha). */
function isCampoSenha(el: Element): boolean {
  if (!(el instanceof HTMLInputElement)) return false;
  const tipo = (el.type || 'text').toLowerCase();
  if (tipo === 'password') return true;
  const autocomplete = (el.autocomplete || '').toLowerCase();
  if (autocomplete === 'current-password' || autocomplete === 'new-password') {
    return true;
  }
  const id = (el.id || '').toLowerCase();
  const name = (el.name || '').toLowerCase();
  return id.includes('senha') || id.includes('password') || name.includes('senha') || name.includes('password');
}

/**
 * Modais usam inputs controlados (`value` + `onChange`). Mutar `input.value` no DOM sem
 * atualizar o estado React faz o próximo render restaurar o valor anterior — o mesmo bug
 * visto na edição do nome do cidadão. Uppercase em modais: CSS `text-transform` + onChange.
 */
function isCampoFormularioModal(el: Element): boolean {
  return el.closest('.modalContent') != null || el.closest('[data-controlled-form]') != null;
}

/** Campos de pesquisa (listagem, tabelas, busca de cadastro) não são convertidos para maiúsculas. */
function isCampoPesquisa(el: Element): boolean {
  if (el.hasAttribute('data-no-uppercase') || el.hasAttribute('data-search-input')) {
    return true;
  }
  if (el.closest('[data-search-area]')) {
    return true;
  }
  if (el instanceof HTMLInputElement && (el.type || 'text').toLowerCase() === 'search') {
    return true;
  }
  return false;
}

function deveForcarUppercase(el: Element): el is HTMLInputElement | HTMLTextAreaElement {
  if (isCampoFormularioModal(el) || isCampoPesquisa(el) || isCampoSenha(el)) return false;

  if (el instanceof HTMLTextAreaElement) {
    return !el.classList.contains('modalInputNormalCase');
  }

  if (el instanceof HTMLInputElement) {
    const tipo = (el.type || 'text').toLowerCase();
    if (tipo !== 'text') return false;
    return !el.classList.contains('modalInputNormalCase');
  }

  return false;
}

export default function GlobalUppercaseEnforcer() {
  useEffect(() => {
    const onInput = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element) || !deveForcarUppercase(target)) return;

      const valorAtual = target.value ?? '';
      const valorUpper = valorAtual.toUpperCase();
      if (valorAtual === valorUpper) return;

      const inicio = target.selectionStart;
      const fim = target.selectionEnd;
      target.value = valorUpper;
      if (inicio != null && fim != null) {
        target.setSelectionRange(inicio, fim);
      }
    };

    document.addEventListener('input', onInput, true);
    return () => document.removeEventListener('input', onInput, true);
  }, []);

  return null;
}
