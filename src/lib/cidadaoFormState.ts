import { formatCpf, formatTelefone } from '@/lib/masks';
import type { CidadaoModelBasico, CidadaoInput } from '@/types/api';

/** Estado de formulário de cidadão com IDs de localização (Estado/Município/Bairro). */
export type CidadaoFormState = CidadaoInput & {
  estadoId?: number;
  municipioId?: number;
  bairroId?: number;
};

export const CIDADAO_FORM_INITIAL: CidadaoFormState = {
  nome: '',
  nomeSocial: '',
  cpf: '',
  nomeMae: '',
  dataNascimento: '',
  sexo: 'NAO_INFORMADO',
  generoId: undefined,
  orientacaoSexualId: undefined,
  racaCor: undefined,
  etniaId: undefined,
  telefone: '',
  celular: '',
  email: '',
  estadoId: undefined,
  municipioId: undefined,
  bairroId: undefined,
  endereco: undefined,
};

export function cidadaoModelToFormState(c: CidadaoModelBasico): CidadaoFormState {
  const end = c.endereco;
  return {
    nome: c.nome ?? '',
    nomeSocial: c.nomeSocial ?? '',
    cpf: formatCpf(c.cpf ?? ''),
    nomeMae: c.nomeMae ?? '',
    dataNascimento: c.dataNascimento ? c.dataNascimento.slice(0, 10) : '',
    sexo: c.sexo ?? 'NAO_INFORMADO',
    generoId: c.genero?.id,
    orientacaoSexualId: c.orientacaoSexual?.id,
    racaCor: c.racaCor,
    etniaId: c.etnia?.id,
    telefone: formatTelefone(c.telefone ?? ''),
    celular: formatTelefone(c.celular ?? ''),
    email: (c.email ?? '').toLowerCase(),
    estadoId: end?.bairro?.municipio?.estado?.id,
    municipioId: end?.bairro?.municipio?.id,
    bairroId: end?.bairro?.id,
    endereco: end
      ? {
          logradouro: end.logradouro ?? '',
          logradouroNumero: end.logradouroNumero ?? '',
          complemento: end.complemento ?? '',
          cep: end.cep ?? '',
          latitude: end.latitude,
          longitude: end.longitude,
          bairro: end.bairro?.id != null ? { id: end.bairro.id } : undefined,
        }
      : undefined,
  };
}
