'use client';

import type { FormEvent } from 'react';
import { UserCheck } from 'lucide-react';
import { ListagemModalActions } from '@/components/listagem';
import { SearchableSelect } from '@/components/SearchableSelect';
import { formatCpf, formatTelefone } from '@/lib/masks';
import type { LocalVotacaoModelBasico } from '@/types/api';
import styles from '@/app/locais-votacao/LocalVotacaoFormModal.module.css';
import wideStyles from './CoordenadorFormModal.module.css';

export type CoordenadorFormState = {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  localTrabalhoCodigo: string;
  localVotacaoCodigo: string;
};

interface Props {
  editCodigo: string | null;
  form: CoordenadorFormState;
  formLoading: boolean;
  locais: LocalVotacaoModelBasico[];
  onChange: (next: CoordenadorFormState) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

function rotuloLocal(item: LocalVotacaoModelBasico) {
  return `Zona ${item.zona} — ${item.localVotacao}`;
}

export function CoordenadorFormModal({
  editCodigo,
  form,
  formLoading,
  locais,
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  const editando = Boolean(editCodigo);
  const opcoesLocais = locais.map((item) => ({
    value: item.codigo,
    label: rotuloLocal(item),
  }));

  return (
    <div className="modalOverlay" role="presentation">
      <div
        className={`modalContent ${styles.shell} ${wideStyles.shell}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coord-modal-title"
      >
        <div className={`${styles.layout} ${wideStyles.layout}`}>
          <aside className={styles.visual} aria-hidden>
            <img
              className={styles.visualImg}
              src="/backgroundequipamentos.png"
              alt=""
            />
            <div className={styles.visualOverlay} />
            <div className={styles.visualContent}>
              <div className={styles.visualIcon}>
                <UserCheck size={26} strokeWidth={1.75} />
              </div>
              <h2>Coordenador</h2>
              <p>Cadastre o responsável e vincule o local de trabalho e o local de votação.</p>
            </div>
          </aside>

          <form className={`${styles.form} ${wideStyles.form}`} onSubmit={onSubmit}>
            <header className={styles.header}>
              <h3 id="coord-modal-title">{editando ? 'Editar cadastro' : 'Novo cadastro'}</h3>
              <p>Todos os campos são obrigatórios, inclusive os dois locais de votação.</p>
            </header>

            <div className={`${styles.body} ${wideStyles.body}`}>
              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Identificação</h4>
                <label className={styles.field} htmlFor="coord-nome">
                  <span className={styles.label}>Nome *</span>
                  <input
                    id="coord-nome"
                    className={styles.input}
                    type="text"
                    required
                    maxLength={255}
                    value={form.nome}
                    onChange={(e) => onChange({ ...form, nome: e.target.value })}
                  />
                </label>
                <div className={styles.grid3}>
                  <label className={styles.field} htmlFor="coord-cpf">
                    <span className={styles.label}>CPF *</span>
                    <input
                      id="coord-cpf"
                      className={styles.input}
                      type="text"
                      required
                      inputMode="numeric"
                      maxLength={14}
                      value={form.cpf}
                      onChange={(e) => onChange({ ...form, cpf: formatCpf(e.target.value) })}
                    />
                  </label>
                  <label className={styles.field} htmlFor="coord-telefone">
                    <span className={styles.label}>Telefone *</span>
                    <input
                      id="coord-telefone"
                      className={styles.input}
                      type="text"
                      required
                      inputMode="tel"
                      maxLength={16}
                      value={form.telefone}
                      onChange={(e) => onChange({ ...form, telefone: formatTelefone(e.target.value) })}
                    />
                  </label>
                  <label className={styles.field} htmlFor="coord-email">
                    <span className={styles.label}>E-mail *</span>
                    <input
                      id="coord-email"
                      className={styles.input}
                      type="email"
                      required
                      maxLength={255}
                      data-no-uppercase
                      value={form.email}
                      onChange={(e) => onChange({ ...form, email: e.target.value })}
                    />
                  </label>
                </div>
              </section>

              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Locais</h4>
                <label className={styles.field} htmlFor="coord-local-trabalho">
                  <span className={styles.label}>Local de trabalho *</span>
                  <SearchableSelect
                    id="coord-local-trabalho"
                    required
                    value={form.localTrabalhoCodigo || undefined}
                    onChange={(value) =>
                      onChange({ ...form, localTrabalhoCodigo: value == null ? '' : String(value) })
                    }
                    options={opcoesLocais}
                    placeholder="Selecione o local de trabalho"
                    searchPlaceholder="Pesquisar por zona ou nome do local..."
                    aria-label="Local de trabalho"
                    maxListHeight={280}
                  />
                </label>
                <label className={styles.field} htmlFor="coord-local-votacao">
                  <span className={styles.label}>Local de votação *</span>
                  <SearchableSelect
                    id="coord-local-votacao"
                    required
                    value={form.localVotacaoCodigo || undefined}
                    onChange={(value) =>
                      onChange({ ...form, localVotacaoCodigo: value == null ? '' : String(value) })
                    }
                    options={opcoesLocais}
                    placeholder="Selecione o local de votação"
                    searchPlaceholder="Pesquisar por zona ou nome do local..."
                    aria-label="Local de votação"
                    maxListHeight={280}
                  />
                </label>
              </section>
            </div>

            <ListagemModalActions
              className={styles.footer}
              editCodigo={editCodigo}
              formLoading={formLoading}
              onCancel={onCancel}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
