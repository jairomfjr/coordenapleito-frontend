'use client';

import type { FormEvent } from 'react';
import { Vote } from 'lucide-react';
import { ListagemModalActions } from '@/components/listagem';
import styles from './LocalVotacaoFormModal.module.css';

export type LocalVotacaoFormState = {
  zona: string;
  localVotacao: string;
  endereco: string;
  bairro: string;
  qtdSecoes: string;
  qtdEleitores: string;
  qtdCoordenadores: string;
};

interface Props {
  editCodigo: string | null;
  form: LocalVotacaoFormState;
  formLoading: boolean;
  camposBloqueados?: boolean;
  onChange: (next: LocalVotacaoFormState) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

export function LocalVotacaoFormModal({
  editCodigo,
  form,
  formLoading,
  camposBloqueados = false,
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  const editando = Boolean(editCodigo);
  const somenteCoordenadores = editando && camposBloqueados;

  return (
    <div className="modalOverlay" role="presentation">
      <div
        className={`modalContent ${styles.shell}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lv-modal-title"
      >
        <div className={styles.layout}>
          <aside className={styles.visual} aria-hidden>
            <img
              className={styles.visualImg}
              src="/backgroundequipamentos.png"
              alt=""
            />
            <div className={styles.visualOverlay} />
            <div className={styles.visualContent}>
              <div className={styles.visualIcon}>
                <Vote size={26} strokeWidth={1.75} />
              </div>
              <h2>Local de votação</h2>
              <p>Organize zona, endereço e capacidade do ponto de votação do pleito.</p>
            </div>
          </aside>

          <form className={styles.form} onSubmit={onSubmit}>
            <header className={styles.header}>
              <h3 id="lv-modal-title">{editando ? 'Editar cadastro' : 'Novo cadastro'}</h3>
              <p>
                {somenteCoordenadores
                  ? 'O grupo sinalizou bloqueio: somente a quantidade de coordenadores pode ser alterada.'
                  : editando
                    ? 'Atualize os dados do local sem alterar regras já validadas no servidor.'
                    : 'Informe identificação, endereço e os quantitativos do local.'}
              </p>
            </header>

            <div className={styles.body}>
              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Identificação</h4>
                <div className={styles.grid2}>
                  <label className={styles.field} htmlFor="lv-zona">
                    <span className={styles.label}>Zona *</span>
                    <input
                      id="lv-zona"
                      className={styles.input}
                      type="number"
                      min={1}
                      required
                      disabled={somenteCoordenadores}
                      value={form.zona}
                      onChange={(e) => onChange({ ...form, zona: e.target.value })}
                    />
                  </label>
                  <label className={styles.field} htmlFor="lv-local">
                    <span className={styles.label}>Local de votação *</span>
                    <input
                      id="lv-local"
                      className={styles.input}
                      type="text"
                      required
                      maxLength={255}
                      disabled={somenteCoordenadores}
                      value={form.localVotacao}
                      onChange={(e) => onChange({ ...form, localVotacao: e.target.value })}
                    />
                  </label>
                </div>
              </section>

              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Endereço</h4>
                <label className={styles.field} htmlFor="lv-endereco">
                  <span className={styles.label}>Logradouro *</span>
                  <input
                    id="lv-endereco"
                    className={styles.input}
                    type="text"
                    required
                    maxLength={255}
                    disabled={somenteCoordenadores}
                    value={form.endereco}
                    onChange={(e) => onChange({ ...form, endereco: e.target.value })}
                  />
                </label>
                <label className={styles.field} htmlFor="lv-bairro">
                  <span className={styles.label}>Bairro *</span>
                  <input
                    id="lv-bairro"
                    className={styles.input}
                    type="text"
                    required
                    maxLength={255}
                    disabled={somenteCoordenadores}
                    value={form.bairro}
                    onChange={(e) => onChange({ ...form, bairro: e.target.value })}
                  />
                </label>
              </section>

              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Capacidade</h4>
                <div className={styles.grid3}>
                  <label className={`${styles.field} ${styles.metric}`} htmlFor="lv-secoes">
                    <span className={styles.label}>Seções *</span>
                    <input
                      id="lv-secoes"
                      className={styles.input}
                      type="number"
                      min={0}
                      required
                      disabled={somenteCoordenadores}
                      value={form.qtdSecoes}
                      onChange={(e) => onChange({ ...form, qtdSecoes: e.target.value })}
                    />
                  </label>
                  <label className={`${styles.field} ${styles.metric}`} htmlFor="lv-eleitores">
                    <span className={styles.label}>Eleitores *</span>
                    <input
                      id="lv-eleitores"
                      className={styles.input}
                      type="number"
                      min={0}
                      required
                      disabled={somenteCoordenadores}
                      value={form.qtdEleitores}
                      onChange={(e) => onChange({ ...form, qtdEleitores: e.target.value })}
                    />
                  </label>
                  <label className={`${styles.field} ${styles.metric}`} htmlFor="lv-coordenadores">
                    <span className={styles.label}>Coordenadores *</span>
                    <input
                      id="lv-coordenadores"
                      className={styles.input}
                      type="number"
                      min={0}
                      required
                      value={form.qtdCoordenadores}
                      onChange={(e) => onChange({ ...form, qtdCoordenadores: e.target.value })}
                    />
                  </label>
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
