const IMPORTADO_SERVICO =
  /serviço\s+importado\s+do\s+sistema\s+antigo\s*(?:\(\s*id_origem\s*=\s*(\d+)\s*\))?/i;
const IMPORTADO_ORGAO =
  /órgão\s+importado\s+do\s+sistema\s+antigo\s*(?:\(\s*id_org[aã]o_origem\s*=\s*(\d+)\s*\))?/i;
const ID_ORIGEM_SUFFIX = /\s*\(\s*id_origem\s*=\s*(\d+)\s*\)/i;
const ID_ORGAO_SUFFIX = /\s*\(\s*id_org[aã]o_origem\s*=\s*(\d+)\s*\)/i;

function normalizeImportedPart(part: string): string {
  const trimmed = part.trim();
  if (!trimmed) return '—';

  const servico = trimmed.match(IMPORTADO_SERVICO);
  if (servico) {
    return servico[1] ? `Serviço #${servico[1]}` : 'Serviço (importado)';
  }

  const orgao = trimmed.match(IMPORTADO_ORGAO);
  if (orgao) {
    return orgao[1] ? `Órgão #${orgao[1]}` : 'Órgão (importado)';
  }

  return trimmed
    .replace(ID_ORIGEM_SUFFIX, (_, id) => ` #${id}`)
    .replace(ID_ORGAO_SUFFIX, (_, id) => ` #${id}`)
    .replace(/\s+/g, ' ')
    .trim();
}

/** Normaliza rótulos de migração e mantém identificadores únicos quando o nome é genérico. */
export function sanitizeVaptVuptLabel(raw: string): string {
  if (!raw.trim()) return '—';

  if (raw.includes('/')) {
    return raw
      .split(/\s*\/\s*/)
      .map(normalizeImportedPart)
      .join(' / ');
  }

  return normalizeImportedPart(raw);
}

export function truncateChartLabel(label: string, maxLength = 36): string {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1).trimEnd()}…`;
}

export type RankingChartItem = {
  label: string;
  labelExibicao: string;
  total: number;
};

function ensureUniqueLabels(items: RankingChartItem[], truncateAt: number): RankingChartItem[] {
  const seen = new Map<string, number>();

  return items.map((item) => {
    const count = seen.get(item.label) ?? 0;
    seen.set(item.label, count + 1);

    if (count === 0) return item;

    const uniqueLabel = `${item.label} (${count + 1})`;
    return {
      ...item,
      label: uniqueLabel,
      labelExibicao: truncateChartLabel(uniqueLabel, truncateAt),
    };
  });
}

type RankingChartOptions = {
  /** Quando false, usa o rótulo da API sem substituir registros importados por "Serviço #id". */
  sanitize?: boolean;
};

export function toRankingChartItems(
  items: { label?: string | null; total?: number | null }[],
  truncateAt = 36,
  options: RankingChartOptions = {}
): RankingChartItem[] {
  const sanitize = options.sanitize !== false;

  const mapped = items.map((item) => {
    const raw = (item.label ?? '—').trim() || '—';
    const completo = sanitize ? sanitizeVaptVuptLabel(raw) : raw;
    return {
      label: completo,
      labelExibicao: truncateChartLabel(completo, truncateAt),
      total: Number(item.total ?? 0),
    };
  });

  return ensureUniqueLabels(mapped, truncateAt);
}
