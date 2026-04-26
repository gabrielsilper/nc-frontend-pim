import { SeverityNc, StatusCa, StatusNc, TypeNc, Profile } from './enums';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  profile: Profile;
}

export interface NonConformityDto {
  id: string;
  number: string;
  title: string;
  description: string;
  type: TypeNc;
  severity: SeverityNc;
  status: StatusNc;
  processLine: string;
  department: string;
  rootCause?: string;
  createdBy: UserDto;
  assignedTo?: UserDto | null;
  openedAt: string;
  dueDate?: string;
  closedAt?: string | null;
}

export interface CorrectiveActionDto {
  id: string;
  nonConformityId: string;
  description: string;
  status: StatusCa;
  deadline: string;
  evidence?: string;
  assignee: UserDto;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNonConformityDto {
  title: string;
  description: string;
  type: TypeNc;
  severity: SeverityNc;
  processLine: string;
  department: string;
}

export interface DashboardCountsDto {
  open: number;
  criticalOrHighOpen: number;
  overdue: number;
  closedThisMonth: number;
  avgTreatmentDays: number;
}

export interface RankingItemDto { type: TypeNc; count: number; delta: number; }

export interface PageDto<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface LoginDto { email: string; password: string; }
export interface TokensDto { accessToken: string; refreshToken: string; }
