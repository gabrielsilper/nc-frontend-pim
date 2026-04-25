export enum SeverityNc {
  BAIXA = 0,
  MEDIA = 1,
  ALTA = 2,
  CRITICA = 3,
}

export const SEVERITY_LABEL: Record<SeverityNc, string> = {
  [SeverityNc.BAIXA]: 'Baixa',
  [SeverityNc.MEDIA]: 'Média',
  [SeverityNc.ALTA]: 'Alta',
  [SeverityNc.CRITICA]: 'Crítica',
};
