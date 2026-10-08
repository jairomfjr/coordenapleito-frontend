'use client';

import { useEffect, useMemo, useState } from 'react';
import { Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { usuariosService } from '@/services/usuarios';
import { gruposService } from '@/services/grupos';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatCpf, formatTelefone, onlyDigits } from '@/lib/masks';
import type {
  UsuarioModelBasico,
  UsuarioInput,
  UsuarioFilter,
  PageResponse,
  GrupoModelBasico,
} from '@/types/api';
import {
  ListagemTitulo,
  ListagemBar,
  ListagemTable,
  ListagemPagination,
  ListagemPanel,
  ListagemPageWrapper,
  ListagemSwitch,
  ListagemModalActions,
} from '@/components/listagem';
import { ConfirmModal } from '@/components/ConfirmModal';
import { StatusAtivoChip } from '@/components/StatusAtivoChip';
import type { AcaoExtra, Coluna } from '@/components/listagem/ListagemTable';
import { hasPermission } from '@/lib/permissions';
import styles from '@/components/listagem/listagem.module.css';
import pageStyles from './page.module.css';

const GRUPO_VARIANT_COUNT = 8;

/** Cor estável por grupo (mesmo código → mesma variante em toda a listagem). */
function varianteContornoGrupo(g: GrupoModelBasico): number {
  const s = g.codigo ?? String(g.id ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) || 0;
  }
  return Math.abs(h) % GRUPO_VARIANT_COUNT;
}

const COLUNAS_BASE: Coluna<UsuarioModelBasico>[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'cpf', label: 'CPF', render: (u) => (u.cpf ? formatCpf(u.cpf) : '—') },
  {
    key: 'contato',
    label: 'Contato',
    render: (u) => u.contato?.email ?? u.contato?.telefone ?? '—',
  },
  {
    key: 'grupos',
    label: 'Grupos',
    render: (u) => {
      const gruposUnicos = u.grupos?.length
        ? u.grupos.filter(
            (g, i, arr) =>
              g.nome &&
              arr.findIndex((x) => (x.codigo ?? x.id) === (g.codigo ?? g.id)) === i,
          )
        : [];
      return gruposUnicos.length ? (
        <span className={pageStyles.grupoChips}>
          {gruposUnicos.map((g) => (
              <span
                key={g.codigo ?? g.id}
                className={pageStyles.grupoChip}
                data-variant={String(varianteContornoGrupo(g))}
              >
                {g.nome}
              </span>
            ))}
        </span>
      ) : (
        '—'
      );
    },
  },
  {
    key: 'ativo',
    label: 'Status',
    render: (u) => <StatusAtivoChip ativo={u.ativo} />,
  },
];

type FormState = {
  nome: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  cargo: string;
  grupoCodigos: string[];
};

const formInitial: FormState = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  email: '',
  telefone: '',
  cargo: '',
  grupoCodigos: [],
};

export default function UsuariosPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const podeReenviarSenha = hasPermission(user, 'usuario.alterar-senha');
  const router = useRouter();
  const [data, setData] = useState<PageResponse<UsuarioModelBasico> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'dados' | 'grupos'>('dados');
  const [editCodigo, setEditCodigo] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState<FormState>(formInitial);
  const [grupos, setGrupos] = useState<GrupoModelBasico[]>([]);
  const [ativandoCodigo, setAtivandoCodigo] = useState<string | null>(null);
  const [editAtivo, setEditAtivo] = useState<boolean | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingExcluir, setPendingExcluir] = useState<UsuarioModelBasico | null>(null);
  const [reenviarSenhaAlvo, setReenviarSenhaAlvo] = useState<UsuarioModelBasico | null>(null);
  const [reenviandoSenha, setReenviandoSenha] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  const loadData = () => {
    if (!isAuthenticated) return;
    setLoading(true);
    usuariosService
      .listar({ page, size, busca: search.trim() || undefined })
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated, page, size, search]);

  useEffect(() => {
    if (!isAuthenticated) return;
    gruposService.listar().then((res) => setGrupos(Array.isArray(res.data) ? res.data : [])).catch(() => setGrupos([]));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!modalOpen) return;
    setModalTab('dados');
    if (editCodigo) {
      let cancelled = false;
      setForm(formInitial);
      setEditAtivo(null);
      usuariosService
        .buscar(editCodigo)
        .then((res) => {
          if (cancelled) return;
          const u = res.data;
          const dataNasc = u.dataNascimento
            ? String(u.dataNascimento).slice(0, 10)
            : '';
          setEditAtivo(u.ativo ?? true);
          setForm({
            nome: u.nome ?? '',
            cpf: u.cpf ? formatCpf(u.cpf) : '',
            dataNascimento: dataNasc,
            email: u.contato?.email ?? '',
            telefone: u.contato?.telefone ? formatTelefone(u.contato.telefone) : '',
            cargo: u.cargo ?? '',
            grupoCodigos:
              u.grupos?.length && u.grupos[0]?.codigo ? [u.grupos[0].codigo] : [],
          });
        })
        .catch((err) => {
          if (cancelled) return;
          toast.error(getApiErrorMessage(err) ?? 'Erro ao carregar usuário.');
        });
      return () => {
        cancelled = true;
      };
    } else {
      setEditAtivo(null);
      setForm(formInitial);
    }
  }, [modalOpen, editCodigo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const payload: UsuarioInput = {
      nome: form.nome.trim(),
      cpf: onlyDigits(form.cpf) || undefined,
      dataNascimento: form.dataNascimento ? `${form.dataNascimento}T00:00:00` : undefined,
      contato: {
        email: form.email.trim() || undefined,
        telefone: form.telefone?.trim() || undefined,
      },
      cargo: form.cargo.trim() || undefined,
      grupos: form.grupoCodigos,
    };
    const promise = editCodigo
      ? usuariosService.atualizar(editCodigo, payload)
      : usuariosService.criar(payload);
    promise
      .then(() => {
        toast.success(editCodigo ? 'Usuário atualizado.' : 'Usuário cadastrado. A senha foi enviada por e-mail.');
        setModalOpen(false);
        setEditCodigo(null);
        setEditAtivo(null);
        loadData();
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setFormLoading(false));
  };

  const handleExcluir = (item: UsuarioModelBasico) => {
    setPendingExcluir(item);
    setConfirmOpen(true);
  };

  const handleConfirmExcluir = () => {
    if (!pendingExcluir) return;
    usuariosService
      .excluir(pendingExcluir.codigo)
      .then(() => {
        toast.success('Usuário excluído.');
        loadData();
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => {
        setConfirmOpen(false);
        setPendingExcluir(null);
      });
  };

  const acoesReenviarSenha = useMemo<AcaoExtra<UsuarioModelBasico>[]>(() => {
    if (!podeReenviarSenha) return [];
    return [
      {
        label: 'Reenviar senha',
        icon: <Mail size={14} aria-hidden />,
        visible: (u) => Boolean(u.contato?.email?.trim()),
        onClick: (u) => setReenviarSenhaAlvo(u),
      },
    ];
  }, [podeReenviarSenha]);

  const handleConfirmReenviarSenha = () => {
    if (!reenviarSenhaAlvo || reenviandoSenha) return;
    setReenviandoSenha(true);
    usuariosService
      .reenviarSenha(reenviarSenhaAlvo.codigo)
      .then(() => {
        toast.success('Nova senha gerada e enviada por e-mail.');
        setReenviarSenhaAlvo(null);
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setReenviandoSenha(false));
  };

  const handleAtivar = (item: UsuarioModelBasico, ativo: boolean) => {
    setAtivandoCodigo(item.codigo);
    usuariosService
      .ativar(item.codigo, ativo)
      .then(() => {
        toast.success(ativo ? 'Usuário ativado.' : 'Usuário desativado.');
        setEditAtivo(ativo);
        loadData();
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setAtivandoCodigo(null));
  };

  const colunas: Coluna<UsuarioModelBasico>[] = COLUNAS_BASE;

  const limparFiltros = () => {
    setSearch('');
    setPage(0);
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <>
    <ListagemPageWrapper>
      <ListagemTitulo recurso="Usuários" />
      <ListagemBar
        searchPlaceholder="Busque por nome, CPF ou e-mail"
        searchValue={search}
        onSearchChange={setSearch}
        onFiltros={loadData}
        onLimparFiltros={limparFiltros}
        onCadastrar={() => {
          setEditCodigo(null);
          setModalOpen(true);
        }}
        labelCadastrar="Cadastrar"
      />
      {loading && <p className={styles.loading}>Carregando...</p>}
      {!loading && data && data.content.length > 0 && (
        <ListagemPanel>
          <ListagemTable
            colunas={colunas}
            dados={data.content}
            rowKey={(item) => item.codigo}
            onEditar={(item) => {
              setEditCodigo(item.codigo);
              setModalOpen(true);
            }}
            acoesExtra={acoesReenviarSenha}
            onExcluir={handleExcluir}
          />
          <ListagemPagination
            totalElements={data.totalElements}
            recursoPlural="Usuários"
            currentPage={page}
            totalPages={data.totalPages}
            first={data.first}
            last={data.last}
            size={size}
            sizeOptions={[5, 10, 25, 50]}
            onPageChange={setPage}
            onSizeChange={(s) => {
              setSize(s);
              setPage(0);
            }}
          />
        </ListagemPanel>
      )}
      {!loading && (!data || data.content.length === 0) && (
        <p className={styles.empty}>Nenhum usuário encontrado ou erro ao carregar.</p>
      )}

      {modalOpen && (
        <div className="modalOverlay">
          <div
            className="modalContent modalContent--extraWide"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{editCodigo ? 'Editar usuário' : 'Cadastrar usuário'}</h2>
            {!editCodigo && (
              <p className="modalSubtitle">Preencha os dados. A senha será gerada e enviada ao e-mail informado.</p>
            )}
            <form onSubmit={handleSubmit}>
              <div className="modalTabs" role="tablist" aria-label="Seções do formulário">
                <button
                  type="button"
                  role="tab"
                  aria-selected={modalTab === 'dados'}
                  aria-controls="tabpanel-dados"
                  id="tab-dados"
                  className={`modalTab ${modalTab === 'dados' ? 'modalTabActive' : ''}`}
                  onClick={() => setModalTab('dados')}
                >
                  Dados pessoais
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={modalTab === 'grupos'}
                  aria-controls="tabpanel-grupos"
                  id="tab-grupos"
                  className={`modalTab ${modalTab === 'grupos' ? 'modalTabActive' : ''}`}
                  onClick={() => setModalTab('grupos')}
                >
                  Grupos
                </button>
              </div>
              <div className="modalFormBody">
              {modalTab === 'dados' && (
                <div id="tabpanel-dados" role="tabpanel" aria-labelledby="tab-dados" className="modalTabPanel">
              <div className="modalFormRow">
                <label>Nome *</label>
                <input
                  type="text"
                  required
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </div>
              <div className="modalFormRow">
                <label>CPF *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  required
                  value={form.cpf}
                  onChange={(e) => setForm((f) => ({ ...f, cpf: formatCpf(e.target.value) }))}
                />
              </div>
              <div className="modalFormRow">
                <label>Data de nascimento</label>
                <input
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) => setForm((f) => ({ ...f, dataNascimento: e.target.value }))}
                />
              </div>
              <div className="modalFormRow">
                <label>E-mail *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="Para envio da senha"
                />
              </div>
              <div className="modalFormRow">
                <label>Telefone</label>
                <input
                  type="text"
                  inputMode="tel"
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={(e) => setForm((f) => ({ ...f, telefone: formatTelefone(e.target.value) }))}
                />
              </div>
              <div className="modalFormRow">
                <label>Cargo</label>
                <input
                  type="text"
                  value={form.cargo}
                  onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
                />
              </div>
              {editCodigo && (
                <div className="modalFormRow">
                  <label>Ativo</label>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ListagemSwitch
                      checked={editAtivo ?? true}
                      onChange={(checked) =>
                        handleAtivar(
                          { codigo: editCodigo, ativo: editAtivo ?? true } as UsuarioModelBasico,
                          checked
                        )
                      }
                      disabled={ativandoCodigo === editCodigo}
                      aria-label={editAtivo ? 'Desativar usuário' : 'Ativar usuário'}
                    />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text, #334155)' }}>
                      {editAtivo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              )}
              </div>
              )}
              {modalTab === 'grupos' && (
                <div id="tabpanel-grupos" role="tabpanel" aria-labelledby="tab-grupos" className="modalTabPanel">
              {grupos.length > 0 ? (
                <div className="modalFormRow modalFormRow--full">
                  <label>Grupo</label>
                  <div className="modalGruposGrid" role="radiogroup" aria-label="Grupo do usuário">
                    {[...grupos]
                      .sort((a, b) => (a.nome ?? '').localeCompare(b.nome ?? '', 'pt-BR'))
                      .map((g) => (
                      <div key={g.codigo}>
                        <ListagemSwitch
                          checked={form.grupoCodigos.includes(g.codigo)}
                          onChange={(checked) =>
                            setForm((f) => ({
                              ...f,
                              grupoCodigos: checked
                                ? [g.codigo]
                                : f.grupoCodigos.filter((c) => c !== g.codigo),
                            }))
                          }
                          aria-label={`Grupo ${g.nome}`}
                        />
                        <span>{g.nome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="modalTabEmpty">Nenhum grupo cadastrado.</p>
              )}
              </div>
              )}
              </div>
              <ListagemModalActions
                editCodigo={editCodigo}
                formLoading={formLoading}
                onCancel={() => !formLoading && setModalOpen(false)}
              />
            </form>
          </div>
        </div>
      )}
    </ListagemPageWrapper>
    <ConfirmModal
      open={confirmOpen}
      title="Confirmar exclusão"
      message="Excluir este usuário?"
      confirmLabel="Excluir"
      onConfirm={handleConfirmExcluir}
      onCancel={() => { setConfirmOpen(false); setPendingExcluir(null); }}
      variant="danger"
    />
    <ConfirmModal
      open={reenviarSenhaAlvo != null}
      title="Reenviar senha"
      message={
        reenviarSenhaAlvo
          ? `Será gerada uma nova senha para ${reenviarSenhaAlvo.nome} e enviada para ${reenviarSenhaAlvo.contato?.email ?? 'o e-mail cadastrado'}. A senha atual deixará de funcionar. Deseja continuar?`
          : ''
      }
      confirmLabel={reenviandoSenha ? 'Enviando...' : 'Reenviar senha'}
      confirmLoading={reenviandoSenha}
      onConfirm={handleConfirmReenviarSenha}
      onCancel={() => {
        if (reenviandoSenha) return;
        setReenviarSenhaAlvo(null);
      }}
    />
    </>
  );
}
