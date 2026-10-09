'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { SearchableSelect } from '@/components/SearchableSelect';
import { getApiErrorView, type ApiErrorView } from '@/lib/apiError';
import { isCpfValido } from '@/lib/cpf';
import { formatCpf, formatTelefone, onlyDigits } from '@/lib/masks';
import { rotuloLocalTrabalho, rotuloLocalVotacao } from '@/lib/rotuloLocalVotacao';
import { coordenadorPublicoService } from '@/services/coordenadorPublico';
import type { LocalVotacaoPublicoModel } from '@/types/api';
import {
  AlertaErroCadastro,
  erroCapacidadeEsgotada,
  erroCpfInvalido,
} from './AlertaErroCadastro';
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

function codigoOuVazio(valor: string | null | undefined) {
  return valor == null || valor === '' ? '' : String(valor);
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
  const [erro, setErro] = useState<ApiErrorView | null>(null);
  const [sucesso, setSucesso] = useState('');
  const [info, setInfo] = useState('');
  const cpfConsultadoRef = useRef('');
  const consultaSeqRef = useRef(0);

  const carregarLocais = useCallback(() => {
    coordenadorPublicoService
      .listarLocais()
      .then((res) => {
        setLocais(res.data);
        setErro((atual) => (atual?.titulo.includes('locais de votação') ? null : atual));
      })
      .catch((err) => setErro(getApiErrorView(err, 'carregar os locais de votação')));
  }, []);

  useEffect(() => {
    carregarLocais();
  }, [carregarLocais]);

  const atualizando = modo === 'existente' && confirmado;
  const camposLiberados = modo === 'novo' || atualizando;
  const opcoesTrabalho = useMemo(
    () =>
      locais.map((item) => {
        const manterAtual = atualizando && item.codigo === localOriginal;
        return {
          value: item.codigo,
          label: rotuloLocalTrabalho(item),
          disabled: Boolean(item.esgotado && !manterAtual),
        };
      }),
    [locais, atualizando, localOriginal]
  );
  const opcoesVotacao = useMemo(
    () => locais.map((item) => ({ value: item.codigo, label: rotuloLocalVotacao(item) })),
    [locais]
  );
  const localTrabalho = locais.find((item) => item.codigo === form.localTrabalhoCodigo);

  const limparEstadoDoCpf = () => {
    setModo(null);
    setConfirmado(false);
    setToken(null);
    setContatoMascarado('');
    setLocalOriginal('');
    setErro(null);
    setSucesso('');
    setInfo('');
    cpfConsultadoRef.current = '';
  };

  const resetarPorCpf = (cpf: string) => {
    setForm({ ...formVazio, cpf });
    limparEstadoDoCpf();
  };

  const onCpfChange = (value: string) => {
    const mascarado = formatCpf(value);
    const digits = onlyDigits(mascarado);
    setForm((atual) => {
      if (onlyDigits(atual.cpf) === digits) {
        return { ...atual, cpf: mascarado };
      }
      return { ...formVazio, cpf: mascarado };
    });
    if (onlyDigits(form.cpf) !== digits) {
      limparEstadoDoCpf();
    }
  };

  const consultarCpf = async (cpfMascarado: string, opcoes?: { reenvio?: boolean }) => {
    const cpf = onlyDigits(cpfMascarado);
    if (!isCpfValido(cpf)) {
      setErro(erroCpfInvalido());
      setModo(null);
      return;
    }
    if (!opcoes?.reenvio && cpfConsultadoRef.current === cpf && modo != null) {
      return;
    }
    const consultaId = ++consultaSeqRef.current;
    setConsultando(true);
    setErro(null);
    setSucesso('');
    try {
      const { data } = await coordenadorPublicoService.consultarCpf(cpf);
      if (consultaId !== consultaSeqRef.current) {
        return;
      }
      cpfConsultadoRef.current = cpf;
      setInfo(data.mensagem);
      if (data.existe) {
        setModo('existente');
        setConfirmado(false);
        setToken(null);
        setContatoMascarado(data.contatoMascarado ?? '');
        if (!opcoes?.reenvio) {
          setForm((atual) => ({ ...formVazio, cpf: atual.cpf }));
        }
      } else {
        setModo('novo');
        setConfirmado(false);
        setToken(null);
        setContatoMascarado('');
      }
    } catch (err) {
      if (consultaId !== consultaSeqRef.current) {
        return;
      }
      setErro(getApiErrorView(err, opcoes?.reenvio ? 'reenviar o código' : 'consultar o CPF'));
      if (!opcoes?.reenvio) {
        setModo(null);
      }
    } finally {
      if (consultaId === consultaSeqRef.current) {
        setConsultando(false);
      }
    }
  };

  const verificarCodigo = async () => {
    setVerificando(true);
    setErro(null);
    try {
      const { data } = await coordenadorPublicoService.verificarCodigo(
        onlyDigits(form.cpf),
        form.codigo
      );
      setToken(data.tokenAtualizacao);
      setConfirmado(true);
      const localTrabalhoCodigo = codigoOuVazio(data.cadastro.localTrabalhoCodigo);
      const localVotacaoCodigo = codigoOuVazio(data.cadastro.localVotacaoCodigo);
      setLocalOriginal(localTrabalhoCodigo);
      setForm((atual) => ({
        ...atual,
        nome: data.cadastro.nome,
        telefone: formatTelefone(data.cadastro.telefone),
        email: data.cadastro.email,
        localTrabalhoCodigo,
        localVotacaoCodigo,
      }));
      setInfo('Identidade confirmada. Você pode atualizar seus dados.');
    } catch (err) {
      setErro(getApiErrorView(err, 'confirmar a identidade'));
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
    if (localTrabalho?.esgotado && !(atualizando && form.localTrabalhoCodigo === localOriginal)) {
      setErro(erroCapacidadeEsgotada());
      return;
    }
    setSalvando(true);
    setErro(null);
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
        resetarPorCpf('');
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
      setErro(getApiErrorView(err, atualizando ? 'atualizar o cadastro' : 'salvar o cadastro'));
      recarregarLocais();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form className={styles.form} data-controlled-form onSubmit={handleSubmit} autoComplete="off">
      {sucesso && <p className={styles.success}>{sucesso}</p>}
      {info && !sucesso && <p className={styles.info}>{info}</p>}
      {erro && (
        <AlertaErroCadastro
          erro={erro}
          onTentarNovamente={
            erro.podeTentarNovamente
              ? () => {
                  setErro(null);
                  carregarLocais();
                  const cpf = onlyDigits(form.cpf);
                  if (isCpfValido(cpf)) {
                    void consultarCpf(form.cpf);
                  }
                }
              : undefined
          }
        />
      )}

      <label className={styles.field}>
        <span className={styles.label}>CPF *</span>
        <input
          className={styles.input}
          value={form.cpf}
          disabled={atualizando}
          inputMode="numeric"
          maxLength={14}
          required
          autoComplete="off"
          onChange={(e) => onCpfChange(e.target.value)}
          onBlur={(e) => consultarCpf(e.target.value)}
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
              onChange={(e) =>
                setForm((atual) => ({ ...atual, codigo: e.target.value.replace(/\D/g, '') }))
              }
            />
          </label>
          <div className={styles.actions} style={{ alignItems: 'flex-end' }}>
            <button
              type="button"
              className={styles.btnSecundario}
              disabled={consultando || verificando}
              onClick={() => consultarCpf(form.cpf, { reenvio: true })}
            >
              {consultando ? 'Reenviando…' : 'Reenviar código'}
            </button>
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
          autoComplete="name"
          onChange={(e) =>
            setForm((atual) => ({ ...atual, nome: e.target.value.toUpperCase() }))
          }
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
            autoComplete="tel"
            onChange={(e) =>
              setForm((atual) => ({ ...atual, telefone: formatTelefone(e.target.value) }))
            }
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
            autoComplete="email"
            onChange={(e) => setForm((atual) => ({ ...atual, email: e.target.value }))}
          />
        </label>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <span className={styles.label}>Onde deseja coordenar? *</span>
          <SearchableSelect
            required={camposLiberados}
            disabled={!camposLiberados}
            value={form.localTrabalhoCodigo || undefined}
            onChange={(value) => {
              const codigo = value == null ? '' : String(value);
              const item = locais.find((local) => local.codigo === codigo);
              const manterAtual = atualizando && codigo === localOriginal;
              if (item?.esgotado && !manterAtual) return;
              setForm((atual) => ({ ...atual, localTrabalhoCodigo: codigo }));
            }}
            options={opcoesTrabalho}
            placeholder="Selecione onde deseja coordenar"
            searchPlaceholder="Pesquisar local..."
            aria-label="Onde deseja coordenar?"
          />
          {localTrabalho && (
            <p className={`${styles.hint} ${localTrabalho.esgotado ? styles.hintWarn : ''}`}>
              {localTrabalho.esgotado
                ? 'Não há vaga para coordenar neste local.'
                : `${localTrabalho.vagasDisponiveis} vaga(s) disponível(is) de ${localTrabalho.capacidade}.`}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Onde você vota? *</span>
          <SearchableSelect
            required={camposLiberados}
            disabled={!camposLiberados}
            value={form.localVotacaoCodigo || undefined}
            onChange={(value) =>
              setForm((atual) => ({
                ...atual,
                localVotacaoCodigo: value == null ? '' : String(value),
              }))
            }
            options={opcoesVotacao}
            placeholder="Selecione onde você vota"
            searchPlaceholder="Pesquisar local..."
            aria-label="Onde você vota?"
          />
        </div>
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
