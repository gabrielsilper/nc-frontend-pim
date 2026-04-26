export enum StatusNc {
  ABERTA = 0,
  EM_TRATAMENTO = 1,
  AGUARDANDO_VERIFICACAO = 2,
  ENCERRADA = 3,
  CANCELADA = 4,
}

export const STATUS_LABEL: Record<StatusNc, string> = {
  [StatusNc.ABERTA]: 'Aberta',
  [StatusNc.EM_TRATAMENTO]: 'Em tratamento',
  [StatusNc.AGUARDANDO_VERIFICACAO]: 'Aguardando verif.',
  [StatusNc.ENCERRADA]: 'Encerrada',
  [StatusNc.CANCELADA]: 'Cancelada',
};

const ALLOWED_TRANSITIONS: Record<StatusNc, StatusNc[]> = {
  [StatusNc.ABERTA]: [StatusNc.EM_TRATAMENTO],
  [StatusNc.EM_TRATAMENTO]: [StatusNc.AGUARDANDO_VERIFICACAO, StatusNc.CANCELADA],
  [StatusNc.AGUARDANDO_VERIFICACAO]: [StatusNc.ENCERRADA, StatusNc.EM_TRATAMENTO],
  [StatusNc.ENCERRADA]: [],
  [StatusNc.CANCELADA]: [],
};

export function allowedStatusTransitions(status: StatusNc): StatusNc[] {
  return ALLOWED_TRANSITIONS[status] ?? [];
}
