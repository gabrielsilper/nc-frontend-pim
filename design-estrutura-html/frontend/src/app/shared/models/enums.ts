// Domain enums — mirror backend src/enums/
export enum StatusNc {
  ABERTA = 'ABERTA',
  EM_TRATAMENTO = 'EM_TRATAMENTO',
  AGUARDANDO_VERIFICACAO = 'AGUARDANDO_VERIFICACAO',
  ENCERRADA = 'ENCERRADA',
  CANCELADA = 'CANCELADA',
}

export enum SeverityNc {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

export enum TypeNc {
  PRODUTO = 'PRODUTO',
  PROCESSO = 'PROCESSO',
  MATERIAL = 'MATERIAL',
  SEGURANCA = 'SEGURANCA',
  OUTRO = 'OUTRO',
}

export enum StatusCa {
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
}

export enum Profile {
  OPERADOR = 'OPERADOR',
  RESPONSAVEL = 'RESPONSAVEL',
  GESTOR = 'GESTOR',
}

export function allowedStatusTransitions(status: StatusNc): StatusNc[] {
  switch (status) {
    case StatusNc.ABERTA:                 return [StatusNc.EM_TRATAMENTO];
    case StatusNc.EM_TRATAMENTO:          return [StatusNc.AGUARDANDO_VERIFICACAO, StatusNc.CANCELADA];
    case StatusNc.AGUARDANDO_VERIFICACAO: return [StatusNc.ENCERRADA, StatusNc.EM_TRATAMENTO];
    default: return [];
  }
}

export const SEVERITY_LABEL: Record<SeverityNc, string> = {
  [SeverityNc.BAIXA]: 'Baixa',
  [SeverityNc.MEDIA]: 'Média',
  [SeverityNc.ALTA]: 'Alta',
  [SeverityNc.CRITICA]: 'Crítica',
};

export const STATUS_LABEL: Record<StatusNc, string> = {
  [StatusNc.ABERTA]: 'Aberta',
  [StatusNc.EM_TRATAMENTO]: 'Em tratamento',
  [StatusNc.AGUARDANDO_VERIFICACAO]: 'Aguard. verif.',
  [StatusNc.ENCERRADA]: 'Encerrada',
  [StatusNc.CANCELADA]: 'Cancelada',
};

export const TYPE_LABEL: Record<TypeNc, string> = {
  [TypeNc.PRODUTO]: 'Produto',
  [TypeNc.PROCESSO]: 'Processo',
  [TypeNc.MATERIAL]: 'Material',
  [TypeNc.SEGURANCA]: 'Segurança',
  [TypeNc.OUTRO]: 'Outro',
};
