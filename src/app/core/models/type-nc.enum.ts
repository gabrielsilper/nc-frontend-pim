export enum TypeNc {
  PRODUTO = 0,
  PROCESSO = 1,
  MATERIAL = 2,
  SEGURANCA = 3,
  OUTRO = 4,
}

export const TYPE_LABEL: Record<TypeNc, string> = {
  [TypeNc.PRODUTO]: 'Produto',
  [TypeNc.PROCESSO]: 'Processo',
  [TypeNc.MATERIAL]: 'Material',
  [TypeNc.SEGURANCA]: 'Segurança',
  [TypeNc.OUTRO]: 'Outro',
};
