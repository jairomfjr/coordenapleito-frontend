'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { locaisVotacaoService } from '@/services/locaisVotacao';
import { getApiErrorMessage } from '@/lib/apiError';
import type { LocalVotacaoInput, LocalVotacaoModelBasico, PageResponse } from '@/types/api';
import {
  ListagemBanner,
  ListagemBar,
  ListagemPageWrapper,
  ListagemPagination,
  ListagemPanel,
  ListagemTable,
} from '@/components/listagem';
import type { Coluna } from '@/components/listagem';
import { ConfirmModal } from '@/components/ConfirmModal';
import { usuarioTemBloqueioCamposLocalVotacao } from '@/lib/permissions';
import { LocalVotacaoFormModal, type LocalVotacaoFormState } from './LocalVotacaoFormModal';
import listagemStyles from '@/components/listagem/listagem.module.css';
import pageStyles from './page.module.css';

function formatQtd(valor?: number) {
  return typeof valor === 'number' ? valor.toLocaleString('pt-BR') : '—';
}

const COLUNAS: Coluna<LocalVotacaoModelBasico>[] = [
  { key: 'zona', label: 'Zona', render: (item) => <span className={pageStyles.number}>{item.zona}</span> },
  { key: 'localVotacao', label: 'Local de votação' },
  { key: 'endereco', label: 'Endereço' },
  { key: 'bairro', label: 'Bairro' },
  { key: 'qtdSecoes', label: 'Seções', render: (item) => <span className={pageStyles.number}>{formatQtd(item.qtdSecoes)}</span> },
  { key: 'qtdEleitores', label: 'Eleitores', render: (item) => <span className={pageStyles.number}>{formatQtd(item.qtdEleitores)}</span> },
  { key: 'qtdCoordenadores', label: 'Coordenadores', render: (item) => <span className={pageStyles.number}>{formatQtd(item.qtdCoordenadores)}</span> },
];

const formInitial: LocalVotacaoFormState = {
  zona: '',
  localVotacao: '',
  endereco: '',
  bairro: '',
  qtdSecoes: '',
  qtdEleitores: '',
  qtdCoordenadores: '',
};

function toInput(form: LocalVotacaoFormState): LocalVotacaoInput {
  return {
    zona: Number(form.zona),
    localVotacao: form.localVotacao.trim(),
    endereco: form.endereco.trim(),
    bairro: form.bairro.trim(),
    qtdSecoes: Number(form.qtdSecoes),
    qtdEleitores: Number(form.qtdEleitores),
    qtdCoordenadores: Number(form.qtdCoordenadores),
  };
}

export default function LocaisVotacaoPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const camposBloqueados = usuarioTemBloqueioCamposLocalVotacao(user);
  const router = useRouter();
  const [data, setData] = useState<PageResponse<LocalVotacaoModelBasico> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCodigo, setEditCodigo] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState<LocalVotacaoFormState>(formInitial);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingExcluir, setPendingExcluir] = useState<LocalVotacaoModelBasico | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  const loadData = () => {
    if (!isAuthenticated) return;
    setLoading(true);
    locaisVotacaoService
      .listar({ page, size, busca: search.trim() || undefined })
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated, page, size, search]);

  useEffect(() => {
    if (!modalOpen) return;
    if (!editCodigo) {
      setForm(formInitial);
      return;
    }
    let cancelled = false;
    locaisVotacaoService
      .buscar(editCodigo)
      .then((res) => {
        if (cancelled) return;
        const item = res.data;
        setForm({
          zona: String(item.zona ?? ''),
          localVotacao: item.localVotacao ?? '',
          endereco: item.endereco ?? '',
          bairro: item.bairro ?? '',
          qtdSecoes: String(item.qtdSecoes ?? ''),
          qtdEleitores: String(item.qtdEleitores ?? ''),
          qtdCoordenadores: String(item.qtdCoordenadores ?? ''),
        });
      })
      .catch((err) => toast.error(getApiErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [modalOpen, editCodigo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const payload = toInput(form);
    const promise = editCodigo
      ? locaisVotacaoService.atualizar(editCodigo, payload)
      : locaisVotacaoService.criar(payload);
    promise
      .then(() => {
        toast.success(editCodigo ? 'Local de votação atualizado.' : 'Local de votação cadastrado.');
        setModalOpen(false);
        setEditCodigo(null);
        loadData();
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setFormLoading(false));
  };

  const handleConfirmExcluir = () => {
    if (!pendingExcluir) return;
    locaisVotacaoService
      .excluir(pendingExcluir.codigo)
      .then(() => {
        toast.success('Local de votação excluído.');
        loadData();
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => {
        setConfirmOpen(false);
        setPendingExcluir(null);
      });
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <>
      <ListagemPageWrapper>
        <ListagemBanner
          titulo="Locais de votação"
          descricao="Cadastre e acompanhe zona, endereço e capacidade de cada ponto de votação."
        />
        <ListagemBar
          searchPlaceholder="Busque por local, endereço, bairro ou zona"
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
          onFiltros={loadData}
          onLimparFiltros={() => {
            setSearch('');
            setPage(0);
          }}
          onCadastrar={() => {
            setEditCodigo(null);
            setModalOpen(true);
          }}
          labelCadastrar="Cadastrar"
        />
        {loading && <p className={listagemStyles.loading}>Carregando...</p>}
        {!loading && data && data.content.length > 0 && (
          <ListagemPanel>
            <ListagemTable
              colunas={COLUNAS}
              dados={data.content}
              rowKey={(item) => item.codigo}
              onEditar={(item) => {
                setEditCodigo(item.codigo);
                setModalOpen(true);
              }}
              onExcluir={(item) => {
                setPendingExcluir(item);
                setConfirmOpen(true);
              }}
            />
            <ListagemPagination
              totalElements={data.totalElements}
              recursoPlural="Locais de votação"
              currentPage={page}
              totalPages={data.totalPages}
              first={data.first}
              last={data.last}
              size={size}
              sizeOptions={[10, 25, 50]}
              onPageChange={setPage}
              onSizeChange={(s) => {
                setSize(s);
                setPage(0);
              }}
            />
          </ListagemPanel>
        )}
        {!loading && (!data || data.content.length === 0) && (
          <p className={listagemStyles.empty}>Nenhum local de votação encontrado.</p>
        )}

        {modalOpen && (
          <LocalVotacaoFormModal
            editCodigo={editCodigo}
            form={form}
            formLoading={formLoading}
            camposBloqueados={camposBloqueados}
            onChange={setForm}
            onSubmit={handleSubmit}
            onCancel={() => !formLoading && setModalOpen(false)}
          />
        )}
      </ListagemPageWrapper>
      <ConfirmModal
        open={confirmOpen}
        title="Confirmar exclusão"
        message="Excluir este local de votação?"
        confirmLabel="Excluir"
        onConfirm={handleConfirmExcluir}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingExcluir(null);
        }}
        variant="danger"
      />
    </>
  );
}
