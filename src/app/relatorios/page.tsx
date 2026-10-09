'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getApiErrorMessage } from '@/lib/apiError';
import { usuarioPodeAcessarRelatorios } from '@/lib/permissions';
import { relatoriosService } from '@/services/relatorios';
import type { CoordenadorVinculoResumoModel, VinculoItemModel } from '@/types/api';
import {
  ListagemBanner,
  ListagemPageWrapper,
  ListagemPanel,
  ListagemTable,
} from '@/components/listagem';
import type { Coluna } from '@/components/listagem';
import listagemStyles from '@/components/listagem/listagem.module.css';
import homeStyles from '@/app/home/home.module.css';

const COLUNAS_ZONA: Coluna<VinculoItemModel>[] = [
  { key: 'nome', label: 'Zona' },
  { key: 'capacidade', label: 'Capacidade' },
  { key: 'vinculados', label: 'Vinculados' },
  { key: 'vagasDisponiveis', label: 'Vagas' },
  {
    key: 'percentualOcupacao',
    label: 'Ocupação',
    render: (item) => `${item.percentualOcupacao.toLocaleString('pt-BR')}%`,
  },
];

const COLUNAS_LOCAL: Coluna<VinculoItemModel>[] = [
  {
    key: 'nome',
    label: 'Local de trabalho',
    render: (item) => `Zona ${item.zona} — ${item.nome}`,
  },
  { key: 'capacidade', label: 'Capacidade' },
  { key: 'vinculados', label: 'Vinculados' },
  { key: 'vagasDisponiveis', label: 'Vagas' },
  {
    key: 'percentualOcupacao',
    label: 'Ocupação',
    render: (item) => `${item.percentualOcupacao.toLocaleString('pt-BR')}%`,
  },
];

export default function RelatoriosPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<CoordenadorVinculoResumoModel | null>(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    if (!usuarioPodeAcessarRelatorios(user)) {
      setErro('Você não tem permissão para acessar esta página.');
      setLoading(false);
      return;
    }
    relatoriosService
      .ocupacao()
      .then((res) => {
        setData(res.data);
        setErro('');
      })
      .catch((err) => setErro(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isAuthenticated, user]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <ListagemPageWrapper>
      <ListagemBanner
        titulo="Relatórios"
        descricao="Ocupação dos coordenadores por zona e local de trabalho."
      />
      {loading && <p className={listagemStyles.loading}>Carregando...</p>}
      {erro && !loading && <p className={homeStyles.empty}>{erro}</p>}
      {!loading && data && (
        <>
          <section className={homeStyles.kpis}>
            <article className={homeStyles.kpi}>
              <p className={homeStyles.kpiLabel}>Vinculados</p>
              <p className={homeStyles.kpiValue}>{data.vinculados.toLocaleString('pt-BR')}</p>
              <p className={homeStyles.kpiHint}>
                {data.percentualOcupacao.toLocaleString('pt-BR')}% da capacidade
              </p>
            </article>
            <article className={homeStyles.kpi}>
              <p className={homeStyles.kpiLabel}>Vagas</p>
              <p className={homeStyles.kpiValue}>{data.vagasDisponiveis.toLocaleString('pt-BR')}</p>
              <p className={homeStyles.kpiHint}>
                {data.locaisComVaga.toLocaleString('pt-BR')} locais com vaga
              </p>
            </article>
            <article className={homeStyles.kpi}>
              <p className={homeStyles.kpiLabel}>Locais</p>
              <p className={homeStyles.kpiValue}>{data.totalLocais.toLocaleString('pt-BR')}</p>
              <p className={homeStyles.kpiHint}>
                {data.locaisEsgotados.toLocaleString('pt-BR')} esgotados
              </p>
            </article>
            <article className={homeStyles.kpi}>
              <p className={homeStyles.kpiLabel}>Zonas</p>
              <p className={homeStyles.kpiValue}>{data.totalZonas.toLocaleString('pt-BR')}</p>
              <p className={homeStyles.kpiHint}>Capacidade por zona de votação</p>
            </article>
          </section>
          {data.porZona.length > 0 && (
            <ListagemPanel>
              <ListagemTable colunas={COLUNAS_ZONA} dados={data.porZona} rowKey={(item) => String(item.zona)} />
            </ListagemPanel>
          )}
          {(data.locaisDestaque ?? []).length > 0 && (
            <ListagemPanel>
              <ListagemTable
                colunas={COLUNAS_LOCAL}
                dados={data.locaisDestaque}
                rowKey={(item) => `${item.zona}-${item.nome}`}
              />
            </ListagemPanel>
          )}
        </>
      )}
    </ListagemPageWrapper>
  );
}
