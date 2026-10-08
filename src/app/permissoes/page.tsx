'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { permissoesService } from '@/services/permissoes';
import { getApiErrorMessage } from '@/lib/apiError';
import type { PermissaoModelBasico, PermissaoInput } from '@/types/api';
import {
  ListagemTitulo,
  ListagemBar,
  ListagemTable,
  ListagemPagination,
  ListagemPanel,
  ListagemPageWrapper,
  ListagemModalActions,
} from '@/components/listagem';
import type { Coluna } from '@/components/listagem';
import { ConfirmModal } from '@/components/ConfirmModal';
import styles from '@/components/listagem/listagem.module.css';

const COLUNAS: Coluna<PermissaoModelBasico>[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'descricao', label: 'Descrição', render: (p) => p.descricao ?? '—' },
];

export default function PermissoesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [lista, setLista] = useState<PermissaoModelBasico[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCodigo, setEditCodigo] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingExcluir, setPendingExcluir] = useState<PermissaoModelBasico | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  const loadData = () => {
    if (!isAuthenticated) return;
    setLoading(true);
    permissoesService
      .listar()
      .then((res) => {
        const data = res.data;
        setLista(Array.isArray(data) ? data : data && typeof data === 'object' ? Object.values(data) : []);
      })
      .catch(() => setLista([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!modalOpen) return;
    if (editCodigo) {
      permissoesService
        .buscar(editCodigo)
        .then((res) => {
          setNome(res.data.nome ?? '');
          setDescricao(res.data.descricao ?? '');
        })
        .catch(() => toast.error('Erro ao carregar permissão.'));
    } else {
      setNome('');
      setDescricao('');
    }
  }, [modalOpen, editCodigo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: PermissaoInput = { nome: nome.trim(), descricao: descricao.trim() || undefined };
    if (!payload.nome) {
      toast.error('Informe o nome da permissão.');
      return;
    }
    setFormLoading(true);
    const promise = editCodigo
      ? permissoesService.atualizar(editCodigo, payload)
      : permissoesService.criar(payload);
    promise
      .then(() => {
        toast.success(editCodigo ? 'Permissão atualizada.' : 'Permissão cadastrada.');
        setModalOpen(false);
        setEditCodigo(null);
        loadData();
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setFormLoading(false));
  };

  const handleExcluir = (item: PermissaoModelBasico) => {
    setPendingExcluir(item);
    setConfirmOpen(true);
  };

  const handleConfirmExcluir = () => {
    if (!pendingExcluir) return;
    permissoesService
      .excluir(pendingExcluir.codigo)
      .then(() => {
        toast.success('Permissão excluída.');
        loadData();
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => {
        setConfirmOpen(false);
        setPendingExcluir(null);
      });
  };

  const filtrada = lista.filter(
    (p) =>
      !busca.trim() ||
      (p.nome ?? '').toLowerCase().includes(busca.trim().toLowerCase()) ||
      (p.descricao ?? '').toLowerCase().includes(busca.trim().toLowerCase())
  );

  if (authLoading || !isAuthenticated) return null;

  return (
    <>
    <ListagemPageWrapper>
      <ListagemTitulo recurso="Permissões" />
      <ListagemBar
        searchPlaceholder="Busque pelo nome ou descrição"
        searchValue={busca}
        onSearchChange={setBusca}
        onFiltros={loadData}
        onLimparFiltros={() => setBusca('')}
        onCadastrar={() => {
          setEditCodigo(null);
          setModalOpen(true);
        }}
        labelCadastrar="Cadastrar"
      />
      {loading && <p className={styles.loading}>Carregando...</p>}
      {!loading && filtrada.length > 0 && (
        <ListagemPanel>
          <ListagemTable
            colunas={COLUNAS}
            dados={filtrada}
            rowKey={(p) => p.codigo}
            onEditar={(p) => {
              setEditCodigo(p.codigo);
              setModalOpen(true);
            }}
            onExcluir={handleExcluir}
          />
          <ListagemPagination
            totalElements={filtrada.length}
            recursoPlural="Permissões"
            currentPage={0}
            totalPages={1}
            first
            last
            size={filtrada.length}
            sizeOptions={[10, 25, 50]}
            onPageChange={() => {}}
            onSizeChange={() => {}}
          />
        </ListagemPanel>
      )}
      {!loading && filtrada.length === 0 && (
        <p className={styles.empty}>Nenhuma permissão encontrada ou erro ao carregar.</p>
      )}

      {modalOpen && (
        <div className="modalOverlay">
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>{editCodigo ? 'Editar permissão' : 'Cadastrar permissão'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modalFormRow">
                <label>Nome *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome da permissão"
                />
              </div>
              <div className="modalFormRow">
                <label>Descrição</label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descrição (opcional)"
                />
              </div>
              <ListagemModalActions
                editCodigo={editCodigo}
                formLoading={formLoading}
                onCancel={() => !formLoading && setModalOpen(false)}
                authRecurso="grupo"
              />
            </form>
          </div>
        </div>
      )}
    </ListagemPageWrapper>
    <ConfirmModal
      open={confirmOpen}
      title="Confirmar exclusão"
      message="Excluir esta permissão?"
      confirmLabel="Excluir"
      onConfirm={handleConfirmExcluir}
      onCancel={() => { setConfirmOpen(false); setPendingExcluir(null); }}
      variant="danger"
    />
    </>
  );
}
