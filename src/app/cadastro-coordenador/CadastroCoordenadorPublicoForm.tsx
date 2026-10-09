'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SearchableSelect } from '@/components/SearchableSelect';
import { getApiErrorMessage } from '@/lib/apiError';
import { isCpfValido } from '@/lib/cpf';
import { formatCpf, formatTelefone, onlyDigits } from '@/lib/masks';
import { coordenadorPublicoService } from '@/services/coordenadorPublico';
import type { LocalVotacaoPublicoModel } from '@/types/api';
import styles from './cadastro-coordenador.module.css';

type FormState = {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  localTrabalhoCodigo: string;
  localVotacaoCodigo: string;
  codigo: string;
};

const formVazio: FormState = {
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  localTrabalhoCodigo: '',
  localVotacaoCodigo: '',
  codigo: '',
};

function rotuloLocal(item: LocalVotacaoPublicoModel) {
  const vagas = item.esgotado ? 'capacidade esgotada' : `${item.vagasDisponiveis} vaga(s)`;
  return `Zona ${item.zona} — ${item.localVotacao} (${vagas})`;
}

export function CadastroCoordenadorPublicoForm() {
  const [form, setForm] = useState<FormState>(formVazio);
  const [locais, setLocais] = useState<LocalVotacaoPublicoModel[]>([]);
  const [modo, setModo] = useState<'novo' | 'existente' | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [contatoMascarado, setContatoMascarado] = useState('');
  const [localOriginal, setLocalOriginal] = useState('');
  const [consultando, setConsultando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    coordenadorPublicoService
      .listarLocais()
      .then((res) => setLocais(res.data))
      .catch((err) => setErro(getApiErrorMessage(err)));
  }, []);

  const opcoesLocais = useMemo(
    () => locais.map((item) => ({ value: item.codigo, label: rotuloLocal(item) })),
    [locais]
  );
  const localVotacao = locais.find((item) => item.codigo === form.localVotacaoCodigo);
  const atualizando = modo === 'existente' && confirmado;
  const camposLiberados = modo === 'novo' || atualizando;

  const resetarPorCpf = (cpf: string) => {
    setForm({ ...formVazio, cpf });
    setModo(null);
    setConfirmado(false);
    setToken(null);
    setContatoMascarado('');
    setLocalOriginal('');
    setErro('');
    setSucesso('');
    setInfo('');
  };

  const consultarCpf = async (cpfMascarado: string) => {
    const cpf = onlyDigits(cpfMascarado);
    if (!isCpfValido(cpf)) {
      setErro('CPF inválido');
      setModo(null);
      return;
    }
    setConsultando(true);
    setErro('');
    setSucesso('');
    try {
      const { data } = await coordenadorPublicoService.consultarCpf(cpf);
      setInfo(data.mensagem);
      if (data.existe) {
        setModo('existente');
        setConfirmado(false);
        setToken(null);
        setContatoMascarado(data.contatoMascarado ?? '');
        setForm((atual) => ({ ...formVazio, cpf: atual.cpf }));
      } else {
        setModo('novo');
        setConfirmado(false);
        setToken(null);
        setContatoMascarado('');
      }
    } catch (err) {
      setErro(getApiErrorMessage(err));
      setModo(null);
    } finally {
      setConsultando(false);
    }
  };

  const verificarCodigo = async () => {
    setVerificando(true);
    setErro('');
    try {
      const { data } = await coordenadorPublicoService.verificarCodigo(
        onlyDigits(form.cpf),
        form.codigo
      );
      setToken(data.tokenAtualizacao);
      setConfirmado(true);
      setLocalOriginal(data.cadastro.localVotacaoCodigo);
      setForm((atual) => ({
        ...atual,
        nome: data.cadastro.nome,
        telefone: formatTelefone(data.cadastro.telefone),
        email: data.cadastro.email,
        localTrabalhoCodigo: data.cadastro.localTrabalhoCodigo,
        localVotacaoCodigo: data.cadastro.localVotacaoCodigo,
      }));
      setInfo('Identidade confirmada. Você pode atualizar seus dados.');
    } catch (err) {
      setErro(getApiErrorMessage(err));
    } finally {
      setVerificando(false);
    }
  };

  const recarregarLocais = () => {
    coordenadorPublicoService.listarLocais().then((res) => setLocais(res.data)).catch(() => undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!camposLiberados) return;
    if (localVotacao?.esgotado && !(atualizando && form.localVotacaoCodigo === localOriginal)) {
      setErro('O local de votação selecionado está com a capacidade esgotada.');
      return;
    }
    setSalvando(true);
    setErro('');
    setSucesso('');
    try {
      if (atualizando && token) {
        await coordenadorPublicoService.atualizar({
          tokenAtualizacao: token,
          nome: form.nome.trim(),
          telefone: onlyDigits(form.telefone),
          email: form.email.trim(),
          localTrabalhoCodigo: form.localTrabalhoCodigo,
          localVotacaoCodigo: form.localVotacaoCodigo,
        });
        setSucesso('Cadastro atualizado com sucesso.');
      } else {
        await coordenadorPublicoService.cadastrar({
          nome: form.nome.trim(),
          cpf: onlyDigits(form.cpf),
          telefone: onlyDigits(form.telefone),
          email: form.email.trim(),
          localTrabalhoCodigo: form.localTrabalhoCodigo,
          localVotacaoCodigo: form.localVotacaoCodigo,
        });
        resetarPorCpf('');
        setSucesso('Cadastro realizado com sucesso.');
      }
      recarregarLocais();
    } catch (err) {
      setErro(getApiErrorMessage(err));
      recarregarLocais();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {sucesso && <p className={styles.success}>{sucesso}</p>}
      {info && !sucesso && <p className={styles.info}>{info}</p>}
      {erro && <p className={styles.error}>{erro}</p>}

      <label className={styles.field}>
        <span className={styles.label}>CPF *</span>
        <input
          className={styles.input}
          value={form.cpf}
          disabled={atualizando}
          inputMode="numeric"
          maxLength={14}
          required
          onChange={(e) => resetarPorCpf(formatCpf(e.target.value))}
          onBlur={() => consultarCpf(form.cpf)}
        />
        {consultando && <p className={styles.hint}>Consultando CPF…</p>}
      </label>

      {modo === 'existente' && !confirmado && (
        <div className={styles.grid2}>
          <label className={styles.field}>
            <span className={styles.label}>Código enviado para {contatoMascarado}</span>
            <input
              className={styles.input}
              value={form.codigo}
              maxLength={6}
              inputMode="numeric"
              onChange={(e) => setForm({ ...form, codigo: e.target.value.replace(/\D/g, '') })}
            />
          </label>
          <div className={styles.actions} style={{ alignItems: 'flex-end' }}>
            <button
              type="button"
              className="modalBtnPrimary"
              disabled={verificando || form.codigo.length < 6}
              onClick={verificarCodigo}
            >
              {verificando ? 'Verificando…' : 'Confirmar identidade'}
            </button>
          </div>
        </div>
      )}

      <label className={styles.field}>
        <span className={styles.label}>Nome *</span>
        <input
          className={styles.input}
          value={form.nome}
          disabled={!camposLiberados}
          required={camposLiberados}
          maxLength={255}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
      </label>

      <div className={styles.grid2}>
        <label className={styles.field}>
          <span className={styles.label}>Telefone *</span>
          <input
            className={styles.input}
            value={form.telefone}
            disabled={!camposLiberados}
            required={camposLiberados}
            inputMode="tel"
            maxLength={16}
            onChange={(e) => setForm({ ...form, telefone: formatTelefone(e.target.value) })}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>E-mail *</span>
          <input
            className={styles.input}
            type="email"
            data-no-uppercase
            value={form.email}
            disabled={!camposLiberados}
            required={camposLiberados}
            maxLength={255}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
      </div>

      <div className={styles.grid2}>
        <label className={styles.field}>
          <span className={styles.label}>Local de trabalho *</span>
          <SearchableSelect
            required={camposLiberados}
            disabled={!camposLiberados}
            value={form.localTrabalhoCodigo || undefined}
            onChange={(value) =>
              setForm({ ...form, localTrabalhoCodigo: value == null ? '' : String(value) })
            }
            options={opcoesLocais}
            placeholder="Selecione o local de trabalho"
            searchPlaceholder="Pesquisar local..."
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Local de votação *</span>
          <SearchableSelect
            required={camposLiberados}
            disabled={!camposLiberados}
            value={form.localVotacaoCodigo || undefined}
            onChange={(value) =>
              setForm({ ...form, localVotacaoCodigo: value == null ? '' : String(value) })
            }
            options={opcoesLocais}
            placeholder="Selecione o local de votação"
            searchPlaceholder="Pesquisar local..."
          />
          {localVotacao && (
            <p className={`${styles.hint} ${localVotacao.esgotado ? styles.hintWarn : ''}`}>
              {localVotacao.esgotado
                ? 'Capacidade esgotada neste local.'
                : `${localVotacao.vagasDisponiveis} vaga(s) disponível(is) de ${localVotacao.capacidade}.`}
            </p>
          )}
        </label>
      </div>

      <div className={styles.actions}>
        <Link href="/login" className={styles.linkLogin}>
          Voltar ao login
        </Link>
        <button
          type="submit"
          className="modalBtnPrimary"
          disabled={!camposLiberados || salvando}
        >
          {salvando
            ? 'Salvando…'
            : atualizando
              ? 'Atualizar cadastro'
              : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
}
