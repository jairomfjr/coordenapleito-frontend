'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { coordenadoresService } from '@/services/coordenadores';
import { locaisVotacaoService } from '@/services/locaisVotacao';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatCpf, formatTelefone, onlyDigits } from '@/lib/masks';
import type {
  CoordenadorInput,
  CoordenadorModelBasico,
  LocalVotacaoModelBasico,
  PageResponse,
} from '@/types/api';
import {
  ListagemBar,
  ListagemPageWrapper,
  ListagemPagination,
  ListagemPanel,
  ListagemTable,
} from '@/components/listagem';
import type { Coluna } from '@/components/listagem';
import { ConfirmModal } from '@/components/ConfirmModal';
import { CoordenadorFormModal, type CoordenadorFormState } from './CoordenadorFormModal';
import listagemStyles from '@/components/listagem/listagem.module.css';
import pageStyles from '@/app/locais-votacao/page.module.css';

function rotuloLocal(item?: LocalVotacaoModelBasico) {
  if (!item) return '—';
  return `Zona ${item.zona} — ${item.localVotacao}`;
}

const COLUNAS: Coluna<CoordenadorModelBasico>[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'cpf', label: 'CPF', render: (item) => formatCpf(item.cpf ?? '') },
  { key: 'telefone', label: 'Telefone', render: (item) => formatTelefone(item.telefone ?? '') },
  { key: 'email', label: 'E-mail' },
  { key: 'localTrabalho', label: 'Local de trabalho', render: (item) => rotuloLocal(item.localTrabalho) },
  { key: 'localVotacao', label: 'Local de votação', render: (item) => rotuloLocal(item.localVotacao) },
];

const formInitial: CoordenadorFormState = {
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  localTrabalhoCodigo: '',
  localVotacaoCodigo: '',
};

function toInput(form: CoordenadorFormState): CoordenadorInput {
  return {
    nome: form.nome.trim(),
    cpf: onlyDigits(form.cpf),
    telefone: onlyDigits(form.telefone),
    email: form.email.trim(),
    localTrabalhoCodigo: form.localTrabalhoCodigo,
    localVotacaoCodigo: form.localVotacaoCodigo,
  };
}

export default function CoordenadoresPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<PageResponse<CoordenadorModelBasico> | null>(null);
  const [locais, setLocais] = useState<LocalVotacaoModelBasico[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCodigo, setEditCodigo] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState<CoordenadorFormState>(formInitial);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingExcluir, setPendingExcluir] = useState<CoordenadorModelBasico | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  const loadData = () => {
    if (!isAuthenticated) return;
    setLoading(true);
    coordenadoresService
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
    locaisVotacaoService
      .listar({ page: 0, size: 500 })
      .then((res) => setLocais(res.data.content ?? []))
      .catch((err) => toast.error(getApiErrorMessage(err)));
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    if (!editCodigo) {
      setForm(formInitial);
      return;
    }
    let cancelled = false;
    coordenadoresService
      .buscar(editCodigo)
      .then((res) => {
        if (cancelled) return;
        const item = res.data;
        setForm({
          nome: item.nome ?? '',
          cpf: formatCpf(item.cpf ?? ''),
          telefone: formatTelefone(item.telefone ?? ''),
          email: item.email ?? '',
          localTrabalhoCodigo: item.localTrabalho?.codigo ?? '',
          localVotacaoCodigo: item.localVotacao?.codigo ?? '',
        });
      })
      .catch((err) => toast.error(getApiErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [modalOpen, editCodigo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.localTrabalhoCodigo || !form.localVotacaoCodigo) {
      toast.error('Selecione o local de trabalho e o local de votação.');
      return;
    }
    setFormLoading(true);
    const payload = toInput(form);
    const promise = editCodigo
      ? coordenadoresService.atualizar(editCodigo, payload)
      : coordenadoresService.criar(payload);
    promise
      .then(() => {
        toast.success(editCodigo ? 'Coordenador atualizado.' : 'Coordenador cadastrado.');
        setModalOpen(false);
        setEditCodigo(null);
        loadData();
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setFormLoading(false));
  };

  const handleConfirmExcluir = () => {
    if (!pendingExcluir) return;
    coordenadoresService
      .excluir(pendingExcluir.codigo)
      .then(() => {
        toast.success('Coordenador excluído.');
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
        <section className={pageStyles.hero} aria-label="Coordenadores">
          <img className={pageStyles.heroImg} src="/backgroundequipamentos.png" alt="" />
          <div className={pageStyles.heroOverlay} />
          <div className={pageStyles.heroContent}>
            <p className={pageStyles.kicker}>Pleito eleitoral</p>
            <h1>Coordenadores</h1>
            <p>Cadastre os coordenadores e vincule o local de trabalho e o local de votação.</p>
          </div>
        </section>
        <ListagemBar
          searchPlaceholder="Busque por nome, CPF, e-mail ou local"
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
              recursoPlural="Coordenadores"
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
          <p className={listagemStyles.empty}>Nenhum coordenador encontrado.</p>
        )}

        {modalOpen && (
          <CoordenadorFormModal
            editCodigo={editCodigo}
            form={form}
            formLoading={formLoading}
            locais={locais}
            onChange={setForm}
            onSubmit={handleSubmit}
            onCancel={() => !formLoading && setModalOpen(false)}
          />
        )}
      </ListagemPageWrapper>
      <ConfirmModal
        open={confirmOpen}
        title="Confirmar exclusão"
        message="Excluir este coordenador?"
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
