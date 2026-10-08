/**
 * Ícones Font Awesome Free para relatórios (PDF / exportações).
 * Alinhado ao backend: RelatorioPdfIcons / RelatorioPdfFontAwesome.
 *
 * @see https://fontawesome.com/icons
 */
import {
  faBriefcase,
  faBuilding,
  faCalendarDays,
  faCircleCheck,
  faCircleQuestion,
  faClipboardList,
  faEnvelope,
  faFileLines,
  faFilter,
  faIdCard,
  faLocationDot,
  faPerson,
  faPersonDress,
  faPhone,
  faUser,
  faUserTie,
  faUsers,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

/** faMale / faFemale (FA6): person / person-dress */
export const ReportIcons = {
  CALENDAR: faCalendarDays,
  PERIOD: faCalendarDays,
  USERS: faUsers,
  BUILDING: faBuilding,
  FILTER: faFilter,
  BRIEFCASE: faBriefcase,
  USER_TIE: faUserTie,
  ID_CARD: faIdCard,
  MALE: faPerson,
  FEMALE: faPersonDress,
  USER: faUser,
  FILE: faFileLines,
  CLIPBOARD: faClipboardList,
  LOCATION: faLocationDot,
  PHONE: faPhone,
  EMAIL: faEnvelope,
  STATUS: faCircleCheck,
  UNKNOWN: faCircleQuestion,
} as const satisfies Record<string, IconDefinition>;

export type ReportIconKey = keyof typeof ReportIcons;

/** Mapeamento de rótulos de relatório → ícone (uso em telas e futuros PDFs jsPDF). */
export const ReportIconByField: Record<string, IconDefinition> = {
  'data de emissão': ReportIcons.CALENDAR,
  período: ReportIcons.PERIOD,
  'total de colaboradores': ReportIcons.USERS,
  'total de usuários': ReportIcons.USERS,
  'total de cidadãos': ReportIcons.USERS,
  'total de setores': ReportIcons.BUILDING,
  unidade: ReportIcons.BUILDING,
  sistema: ReportIcons.BUILDING,
  'tipo de setor': ReportIcons.FILTER,
  cargo: ReportIcons.BRIEFCASE,
  função: ReportIcons.BRIEFCASE,
  vínculo: ReportIcons.USER_TIE,
  matrícula: ReportIcons.ID_CARD,
  cpf: ReportIcons.ID_CARD,
  masculino: ReportIcons.MALE,
  homens: ReportIcons.MALE,
  feminino: ReportIcons.FEMALE,
  mulheres: ReportIcons.FEMALE,
  pessoa: ReportIcons.USER,
  'não informado': ReportIcons.UNKNOWN,
  observações: ReportIcons.FILE,
  'relatório executivo': ReportIcons.CLIPBOARD,
  'modo de dados': ReportIcons.CLIPBOARD,
  endereço: ReportIcons.LOCATION,
  telefone: ReportIcons.PHONE,
  'e-mail': ReportIcons.EMAIL,
  email: ReportIcons.EMAIL,
  status: ReportIcons.STATUS,
};
