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
