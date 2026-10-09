'use client';

import type { FormEvent } from 'react';
import { UserCheck } from 'lucide-react';
import { ListagemModalActions } from '@/components/listagem';
import { SearchableSelect } from '@/components/SearchableSelect';
import { formatCpf, formatTelefone } from '@/lib/masks';
import { rotuloLocalTrabalho, rotuloLocalVotacao } from '@/lib/rotuloLocalVotacao';
import type { LocalVotacaoPublicoModel } from '@/types/api';
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
  locais: LocalVotacaoPublicoModel[];
  localTrabalhoOriginalCodigo?: string;
  onChange: (next: CoordenadorFormState) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

export function CoordenadorFormModal({
  editCodigo,
  form,
  formLoading,
  locais,
  localTrabalhoOriginalCodigo = '',
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  const editando = Boolean(editCodigo);
  const opcoesTrabalho = locais.map((item) => ({
    value: item.codigo,
    label: rotuloLocalTrabalho(item),
    disabled: Boolean(item.esgotado && item.codigo !== localTrabalhoOriginalCodigo),
  }));
  const opcoesVotacao = locais.map((item) => ({
    value: item.codigo,
    label: rotuloLocalVotacao(item),
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
              <p>Cadastre o responsável e informe onde deseja coordenar e onde vota.</p>
            </div>
          </aside>

          <form className={`${styles.form} ${wideStyles.form}`} onSubmit={onSubmit}>
            <header className={styles.header}>
              <h3 id="coord-modal-title">{editando ? 'Editar cadastro' : 'Novo cadastro'}</h3>
              <p>Todos os campos são obrigatórios, inclusive onde deseja coordenar e onde vota.</p>
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
                <div className={styles.field}>
                  <span className={styles.label}>Onde deseja coordenar? *</span>
                  <SearchableSelect
                    id="coord-local-trabalho"
                    required
                    value={form.localTrabalhoCodigo || undefined}
                    onChange={(value) => {
                      const codigo = value == null ? '' : String(value);
                      const item = locais.find((local) => local.codigo === codigo);
                      if (item?.esgotado && codigo !== localTrabalhoOriginalCodigo) return;
                      onChange({ ...form, localTrabalhoCodigo: codigo });
                    }}
                    options={opcoesTrabalho}
                    placeholder="Selecione onde deseja coordenar"
                    searchPlaceholder="Pesquisar por zona ou nome do local..."
                    aria-label="Onde deseja coordenar?"
                    maxListHeight={280}
                  />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Onde você vota? *</span>
                  <SearchableSelect
                    id="coord-local-votacao"
                    required
                    value={form.localVotacaoCodigo || undefined}
                    onChange={(value) =>
                      onChange({ ...form, localVotacaoCodigo: value == null ? '' : String(value) })
                    }
                    options={opcoesVotacao}
                    placeholder="Selecione onde você vota"
                    searchPlaceholder="Pesquisar por zona ou nome do local..."
                    aria-label="Onde você vota?"
                    maxListHeight={280}
                  />
                </div>
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
