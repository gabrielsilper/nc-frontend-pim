export enum Profile {
  OPERADOR,
  RESPONSAVEL,
  GESTOR,
}

export const PROFILE_LABEL: Record<Profile, string> = {
  [Profile.OPERADOR]: 'Operador',
  [Profile.RESPONSAVEL]: 'Responsável',
  [Profile.GESTOR]: 'Gestor',
};
