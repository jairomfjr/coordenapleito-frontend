import type { LocalVotacaoPublicoModel } from '@/types/api';

export function rotuloLocalVotacao(item: { zona: number; localVotacao: string }) {
  return `Zona ${item.zona} — ${item.localVotacao}`;
}

export function rotuloLocalTrabalho(item: LocalVotacaoPublicoModel) {
  const vagas = item.esgotado ? 'capacidade esgotada' : `${item.vagasDisponiveis} vaga(s)`;
  return `${rotuloLocalVotacao(item)} (${vagas})`;
}
