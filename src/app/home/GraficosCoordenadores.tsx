'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
} from 'recharts';
import type { CoordenadorVinculoResumoModel } from '@/types/api';
import { ChartCard } from './ChartCard';
import {
  COR_EIXO,
  COR_ESGOTADO,
  COR_NEUTRO,
  COR_VAGA,
  COR_VINCULO,
  PALETA,
  fmt,
  rotuloLocal,
  tooltipStyle,
} from './chartTheme';
import styles from './home.module.css';

export function GraficosCoordenadores({ data }: { data: CoordenadorVinculoResumoModel }) {
  const pct = Math.min(100, Math.max(0, data.percentualOcupacao));
  const semCapacidade = Math.max(0, data.totalLocais - data.locaisComVaga - data.locaisEsgotados);
  const ocupacao = [
    { name: 'Vinculados', value: data.vinculados, fill: COR_VINCULO },
    { name: 'Vagas', value: data.vagasDisponiveis, fill: COR_VAGA },
  ].filter((item) => item.value > 0);
  const situacao = [
    { name: 'Com vaga', value: data.locaisComVaga, fill: COR_VAGA },
    { name: 'Esgotados', value: data.locaisEsgotados, fill: COR_ESGOTADO },
    { name: 'Sem capacidade', value: semCapacidade, fill: COR_NEUTRO },
  ].filter((item) => item.value > 0);
  const zonas = data.porZona.map((z) => ({
    nome: z.nome,
    vinculados: z.vinculados,
    vagas: z.vagasDisponiveis,
    ocupacao: z.percentualOcupacao,
  }));
  const treemap = data.locaisDestaque.map((l, i) => ({
    name: rotuloLocal(l.zona, l.nome),
    size: Math.max(l.vinculados, 0.4),
    fill: PALETA[i % PALETA.length],
  }));
  const rankingVagas = (data.locaisComMaisVagas ?? []).map((l) => ({
    nome: rotuloLocal(l.zona, l.nome),
    vagas: l.vagasDisponiveis,
  }));

  return (
    <>
      <section className={styles.grid3}>
        <ChartCard titulo="Ocupação" hint="Percentual da capacidade já preenchida.">
          <div className={styles.gaugeWrap}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={[{ v: 100 }]} dataKey="v" innerRadius={72} outerRadius={96} fill={COR_NEUTRO} stroke="none" />
                <Pie
                  data={[{ v: pct }, { v: 100 - pct }]}
                  dataKey="v"
                  innerRadius={72}
                  outerRadius={96}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  <Cell fill={COR_VINCULO} />
                  <Cell fill="transparent" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.gaugeCenter}>
              <span className={styles.gaugeValue}>{fmt(pct)}%</span>
              <span className={styles.gaugeHint}>{fmt(data.vinculados)} de {fmt(data.capacidadeTotal)}</span>
            </div>
          </div>
        </ChartCard>

        <ChartCard titulo="Vinculados × vagas" hint="Distribuição da capacidade total.">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={ocupacao} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={4} stroke="#fff" strokeWidth={3}>
                {ocupacao.map((item) => (
                  <Cell key={item.name} fill={item.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => fmt(Number(value ?? 0))} contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard titulo="Situação dos locais" hint="Locais com vaga, esgotados ou sem capacidade.">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={situacao} dataKey="value" nameKey="name" innerRadius={50} outerRadius={86} paddingAngle={3} stroke="#fff" strokeWidth={3}>
                {situacao.map((item) => (
                  <Cell key={item.name} fill={item.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => fmt(Number(value ?? 0))} contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {zonas.length > 0 && (
        <section className={styles.grid2}>
          <ChartCard titulo="Ocupação por zona" hint="Evolução percentual ao longo das zonas.">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={zonas} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gradOcupacao" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COR_VINCULO} stopOpacity={0.38} />
                    <stop offset="100%" stopColor={COR_VINCULO} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f1eaea" />
                <XAxis dataKey="nome" tick={{ fill: COR_EIXO, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: COR_EIXO, fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${fmt(Number(value ?? 0))}%`} />
                <Area type="monotone" dataKey="ocupacao" name="Ocupação" stroke={COR_VINCULO} strokeWidth={2.4} fill="url(#gradOcupacao)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard titulo="Radar das zonas" hint="Comparativo de ocupação percentual.">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={zonas} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid stroke="#f0dede" />
                <PolarAngleAxis dataKey="nome" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Ocupação %" dataKey="ocupacao" stroke={COR_VINCULO} fill={COR_VINCULO} fillOpacity={0.28} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${fmt(Number(value ?? 0))}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>
      )}

      {zonas.length > 0 && (
        <ChartCard wide titulo="Vínculos e vagas por zona" hint="Barras de volume com a linha de ocupação percentual.">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={zonas} barCategoryGap="26%">
              <CartesianGrid vertical={false} stroke="#f1eaea" />
              <XAxis dataKey="nome" tick={{ fill: COR_EIXO, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="vol" allowDecimals={false} tick={{ fill: COR_EIXO, fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
              <YAxis yAxisId="pct" orientation="right" domain={[0, 100]} tick={{ fill: COR_EIXO, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar yAxisId="vol" dataKey="vinculados" name="Vinculados" fill={COR_VINCULO} radius={[6, 6, 0, 0]} maxBarSize={18} />
              <Bar yAxisId="vol" dataKey="vagas" name="Vagas" fill={COR_VAGA} radius={[6, 6, 0, 0]} maxBarSize={18} />
              <Line yAxisId="pct" type="monotone" dataKey="ocupacao" name="Ocupação %" stroke={COR_ESGOTADO} strokeWidth={2.2} dot={{ r: 3, fill: COR_ESGOTADO }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      <section className={styles.grid2}>
        {treemap.length > 0 && (
          <ChartCard titulo="Mapa dos locais" hint="Área proporcional aos coordenadores vinculados.">
            <ResponsiveContainer width="100%" height={260}>
              <Treemap data={treemap} dataKey="size" nameKey="name" stroke="#fff" aspectRatio={4 / 3} colorPanel={PALETA}>
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [fmt(Number(value ?? 0)), String(name)]} />
              </Treemap>
            </ResponsiveContainer>
          </ChartCard>
        )}
        {rankingVagas.length > 0 && (
          <ChartCard titulo="Onde ainda faltam coordenadores" hint="Locais de trabalho com mais vagas abertas.">
            <ResponsiveContainer width="100%" height={Math.max(180, rankingVagas.length * 34)}>
              <BarChart data={rankingVagas} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid horizontal={false} stroke="#f1eaea" />
                <XAxis type="number" allowDecimals={false} tick={{ fill: COR_EIXO, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nome" width={200} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="vagas" name="Vagas" fill={COR_VAGA} radius={[0, 8, 8, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </section>
    </>
  );
}
