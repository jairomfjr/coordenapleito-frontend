import type { EquipamentoModelBasico, PermissaoArvoreNodeModel } from '@/types/api';

const SEM_COORDENACAO_ID = 0;

/** Agrupa equipamentos por coordenação para exibição em árvore (checkbox por coordenação e por equipamento). */
export function montarArvoreEquipamentosPorCoordenacao(
  equipamentos: EquipamentoModelBasico[]
): PermissaoArvoreNodeModel[] {
  const validos = equipamentos.filter(
    (eq) => eq.codigo != null && String(eq.codigo).trim() !== ''
  );

  const grupos = new Map<
    number,
    { descricao: string; equipamentos: EquipamentoModelBasico[] }
  >();

  for (const eq of validos) {
    const coordId = eq.coordenacao?.id ?? SEM_COORDENACAO_ID;
    const coordDesc =
      coordId === SEM_COORDENACAO_ID
        ? 'Sem coordenação'
        : eq.coordenacao?.descricao?.trim() || 'Sem coordenação';

    if (!grupos.has(coordId)) {
      grupos.set(coordId, { descricao: coordDesc, equipamentos: [] });
    }
    grupos.get(coordId)!.equipamentos.push(eq);
  }

  return Array.from(grupos.entries())
    .sort(([, a], [, b]) => a.descricao.localeCompare(b.descricao, 'pt-BR'))
    .map(([coordId, g]) => ({
      modulo: String(coordId),
      descricao: g.descricao,
      filhos: g.equipamentos
        .sort((a, b) => (a.nome ?? '').localeCompare(b.nome ?? '', 'pt-BR'))
        .map((eq) => ({
          chave: String(eq.codigo),
          descricao: eq.nome?.trim() || 'Equipamento',
        })),
    }));
}
