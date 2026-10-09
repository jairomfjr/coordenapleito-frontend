'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { gruposService } from '@/services/grupos';
import { permissoesService } from '@/services/permissoes';
import { getApiErrorMessage } from '@/lib/apiError';
import type {
  GrupoModelBasico,
  GrupoInput,
  PermissaoArvoreNodeModel,
  PermissaoModelBasico,
} from '@/types/api';
import {
  ListagemBanner,
  ListagemBar,
  ListagemTable,
  ListagemPagination,
  ListagemPanel,
  ListagemPageWrapper,
  ListagemModalActions,
} from '@/components/listagem';
import type { Coluna } from '@/components/listagem';
import { ConfirmModal } from '@/components/ConfirmModal';
import { PermissaoTree } from '@/components/PermissaoTree';
import {
  CHAVES_MINIMAS_PROPRIO_GRUPO,
  usuarioEditaProprioGrupo,
} from '@/lib/grupoPermissoesProprias';
import listagemStyles from '@/components/listagem/listagem.module.css';
import modalStyles from './GrupoFormModal.module.css';

const COLUNAS: Coluna<GrupoModelBasico>[] = [
  { key: 'nome', label: 'Nome' },
  {
    key: 'permissoes',
    label: 'Permissões',
    render: (g) =>
      g.permissoes?.length
        ? g.permissoes.map((p) => p.chave ?? p.descricao ?? p.nome).join(', ')
        : '—',
  },
];

export default function GruposPage() {
  const { user, isAuthenticated, loading: authLoading, refreshSession } = useAuth();
  const router = useRouter();
  const [lista, setLista] = useState<GrupoModelBasico[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCodigo, setEditCodigo] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [nomeOriginal, setNomeOriginal] = useState('');
  const [arvorePermissoes, setArvorePermissoes] = useState<PermissaoArvoreNodeModel[]>([]);
  const [chavesSelecionadas, setChavesSelecionadas] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingExcluir, setPendingExcluir] = useState<GrupoModelBasico | null>(null);
  const permissoesDirtyRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  const loadData = () => {
    if (!isAuthenticated) return;
    setLoading(true);
    gruposService
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
    if (!modalOpen) {
      permissoesDirtyRef.current = false;
      return;
    }
    permissoesDirtyRef.current = false;
    permissoesService
      .arvore()
      .then((res) => setArvorePermissoes(res.data ?? []))
      .catch(() => setArvorePermissoes([]));
    if (editCodigo) {
      gruposService
        .listarPermissoes(editCodigo)
        .then((res) => {
          if (permissoesDirtyRef.current) return;
          const data = res.data;
          const arr: PermissaoModelBasico[] = Array.isArray(data)
            ? data
            : data && typeof data === 'object'
              ? (Object.values(data) as PermissaoModelBasico[])
              : [];
          const chavesSet = new Set(
            arr.map((p) => p.chave).filter((c): c is string => Boolean(c))
          );
          if (usuarioEditaProprioGrupo(editCodigo, user?.gruposCodigos, user?.roles, nomeOriginal || nome)) {
            for (const c of CHAVES_MINIMAS_PROPRIO_GRUPO) chavesSet.add(c);
          }
          setChavesSelecionadas(chavesSet);
        })
        .catch(() => toast.error('Erro ao carregar permissões do grupo.'));
      gruposService
        .buscar(editCodigo)
        .then((res) => {
          const n = res.data.nome ?? '';
          setNome(n);
          setNomeOriginal(n);
        })
        .catch(() => toast.error('Erro ao carregar grupo.'));
    } else {
      setNome('');
      setNomeOriginal('');
      setChavesSelecionadas(new Set());
    }
  }, [modalOpen, editCodigo, user?.gruposCodigos]);

  const fecharModal = () => {
    if (formLoading) return;
    setModalOpen(false);
    setEditCodigo(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: GrupoInput = { nome: nome.trim() };
    if (!payload.nome) {
      toast.error('Informe o nome do grupo.');
      return;
    }
    if (chavesSelecionadas.size === 0) {
      toast.error('Selecione ao menos uma permissão para o grupo.');
      return;
    }
    const editandoProprioGrupo = usuarioEditaProprioGrupo(
      editCodigo,
      user?.gruposCodigos,
      user?.roles,
      nomeOriginal || nome
    );
    const chavesParaSalvar = [...chavesSelecionadas];
    if (editandoProprioGrupo) {
      for (const c of CHAVES_MINIMAS_PROPRIO_GRUPO) {
        if (!chavesParaSalvar.includes(c)) chavesParaSalvar.push(c);
      }
    }
    setFormLoading(true);
    const nomeAlterado = Boolean(editCodigo) && nome.trim() !== nomeOriginal.trim();
    const salvarFluxo = async () => {
      let codigoGrupo = editCodigo!;
      if (!editCodigo) {
        const res = await gruposService.criar(payload);
        codigoGrupo = res.data.codigo;
      } else if (nomeAlterado) {
        await gruposService.atualizar(editCodigo, payload);
      }
      await gruposService.substituirPermissoesPorChaves(codigoGrupo, chavesParaSalvar);
      if (
        editandoProprioGrupo ||
        usuarioEditaProprioGrupo(codigoGrupo, user?.gruposCodigos, user?.roles, nomeOriginal || nome)
      ) {
        await refreshSession();
      }
      return codigoGrupo;
    };
    salvarFluxo()
      .then((codigoGrupo) => {
        toast.success(editCodigo ? 'Grupo atualizado.' : 'Grupo cadastrado.');
        if (!editCodigo) {
          setEditCodigo(codigoGrupo);
          setNomeOriginal(nome.trim());
        } else if (nomeAlterado) {
          setNomeOriginal(nome.trim());
        }
        loadData();
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setFormLoading(false));
  };

  const handleExcluir = (item: GrupoModelBasico) => {
    setPendingExcluir(item);
    setConfirmOpen(true);
  };

  const handleConfirmExcluir = () => {
    if (!pendingExcluir) return;
    gruposService
      .excluir(pendingExcluir.codigo)
      .then(() => {
        toast.success('Grupo excluído.');
        loadData();
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => {
        setConfirmOpen(false);
        setPendingExcluir(null);
      });
  };

  const filtrada = lista.filter((g) => !busca.trim() || (g.nome ?? '').toLowerCase().includes(busca.trim().toLowerCase()));

  if (authLoading || !isAuthenticated) return null;

  const tituloModal = editCodigo ? 'Editar grupo' : 'Cadastrar grupo';
  const subtituloModal = editCodigo
    ? 'Atualize o nome e ajuste as permissões vinculadas a este perfil de acesso.'
    : 'Informe o nome do grupo e selecione as permissões que os usuários deste perfil terão no sistema.';

  const editandoProprioGrupo = usuarioEditaProprioGrupo(
    editCodigo,
    user?.gruposCodigos,
    user?.roles,
    nomeOriginal || nome
  );
  const chavesFixasProprioGrupo = editandoProprioGrupo
    ? new Set<string>(CHAVES_MINIMAS_PROPRIO_GRUPO)
    : undefined;

  return (
    <>
    <ListagemPageWrapper>
      <ListagemBanner
        titulo="Grupos"
        descricao="Cadastre os grupos e vincule as permissões de cada perfil de acesso."
      />
      <ListagemBar
        searchPlaceholder="Busque pelo nome do grupo"
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
      {loading && <p className={listagemStyles.loading}>Carregando...</p>}
      {!loading && filtrada.length > 0 && (
        <ListagemPanel>
          <ListagemTable
            colunas={COLUNAS}
            dados={filtrada}
            rowKey={(g) => g.codigo}
            onEditar={(g) => {
              setEditCodigo(g.codigo);
              setModalOpen(true);
            }}
            onExcluir={handleExcluir}
          />
          <ListagemPagination
            totalElements={filtrada.length}
            recursoPlural="Grupos"
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
        <p className={listagemStyles.empty}>Nenhum grupo encontrado ou erro ao carregar.</p>
      )}

      {modalOpen && (
        <div className="modalOverlay" role="presentation">
          <div
            className={`modalContent ${modalStyles.shell}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="grupo-modal-title"
          >
            <header className={modalStyles.header}>
              <div className={modalStyles.headerText}>
                <h2 id="grupo-modal-title">{tituloModal}</h2>
                <p className={modalStyles.subtitle}>{subtituloModal}</p>
              </div>
              <button
                type="button"
                className="modalGlobalCloseBtn"
                onClick={fecharModal}
                aria-label="Fechar"
                disabled={formLoading}
              >
                <X size={18} strokeWidth={2} aria-hidden />
              </button>
            </header>

            <form onSubmit={handleSubmit} className={modalStyles.form}>
              <div className={modalStyles.body}>
                <section className={modalStyles.section}>
                  <h3 className={modalStyles.sectionTitle}>Identificação</h3>
                  <label className={modalStyles.label} htmlFor="grupo-nome">
                    Nome do grupo *
                  </label>
                  <input
                    id="grupo-nome"
                    type="text"
                    required
                    className={modalStyles.input}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex.: Analista, Coordenador..."
                    autoComplete="off"
                  />
                </section>

                <section className={modalStyles.permissionsSection}>
                  <h3 className={modalStyles.sectionTitle}>Permissões de acesso</h3>
                  {editandoProprioGrupo && (
                    <p className={modalStyles.loadingHint} style={{ marginBottom: '0.75rem' }}>
                      Você está editando o grupo do seu usuário. Permissões de administração de
                      grupos (menu, listar, editar, gerenciar permissões) não podem ser removidas
                      aqui — outro administrador pode alterá-las se necessário.
                    </p>
                  )}
                  {arvorePermissoes.length > 0 ? (
                    <PermissaoTree
                      arvore={arvorePermissoes}
                      selecionadas={chavesSelecionadas}
                      chavesFixas={chavesFixasProprioGrupo}
                      onChange={(chaves) => {
                        permissoesDirtyRef.current = true;
                        setChavesSelecionadas(chaves);
                      }}
                    />
                  ) : (
                    <p className={modalStyles.loadingHint}>Carregando árvore de permissões...</p>
                  )}
                </section>
              </div>

              <ListagemModalActions
                className={modalStyles.footer}
                editCodigo={editCodigo}
                formLoading={formLoading}
                onCancel={fecharModal}
              />
            </form>
          </div>
        </div>
      )}
    </ListagemPageWrapper>
    <ConfirmModal
      open={confirmOpen}
      title="Confirmar exclusão"
      message="Excluir este grupo?"
      confirmLabel="Excluir"
      onConfirm={handleConfirmExcluir}
      onCancel={() => { setConfirmOpen(false); setPendingExcluir(null); }}
      variant="danger"
    />
    </>
  );
}
