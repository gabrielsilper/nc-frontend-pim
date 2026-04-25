import { TypeNc } from './type-nc.enum';

export interface DashboardCountsDTO {
  openNonConformities: number;
  warningNonConformities: number;
  expiredNonConformities: number;
  closedNonConformities: number;
}

export interface RankingItemDTO {
  type: TypeNc;
  name: string;
  total: number;
}
