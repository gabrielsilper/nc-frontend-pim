import { Profile } from './profile.enum';
import { SeverityNc } from './severity-nc.enum';
import { StatusNc } from './status-nc.enum';
import { TypeNc } from './type-nc.enum';

export interface EmbeddedUserDTO {
  id: string;
  name: string;
  profile: Profile;
}

export enum StatusCa {
  PENDENTE = 0,
  EM_ANDAMENTO = 1,
  CONCLUIDA = 2,
}

export const STATUS_CA_LABEL: Record<StatusCa, string> = {
  [StatusCa.PENDENTE]: 'Pendente',
  [StatusCa.EM_ANDAMENTO]: 'Em andamento',
  [StatusCa.CONCLUIDA]: 'Concluída',
};

export interface ResponseNonConformityDTO {
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
  createdBy: EmbeddedUserDTO;
  assignedTo: EmbeddedUserDTO | null;
  openedAt: string;
  dueDate?: string;
  closedAt?: string | null;
}

export interface ResponseNonConformitiesPageDTO {
  items: ResponseNonConformityDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
}

export interface CreateNonConformityDTO {
  title: string;
  description: string;
  type: TypeNc;
  severity: SeverityNc;
  processLine: string;
  department: string;
}

export interface FindNonConformitiesQuery {
  page?: number;
  pageSize?: number;
  order?: 'ASC' | 'DESC';
  search?: string;
  status?: StatusNc;
  severity?: SeverityNc;
  type?: TypeNc;
  expired?: 0 | 1;
  assignedToId?: string;
}

export interface UpdateNonConformityDTO {
  title?: string;
  description?: string;
  type?: TypeNc;
  severity?: SeverityNc;
  processLine?: string;
  department?: string;
  rootCause?: string;
}

export interface AssignNonConformityDTO {
  assignedToId: string;
  dueDate: string;
}

export interface ResponseCorrectiveActionDTO {
  id: string;
  description: string;
  status: StatusCa;
  deadline: string;
  evidence?: string;
  nonConformityId: string;
  assignee: EmbeddedUserDTO;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCorrectiveActionDTO {
  description: string;
  status: StatusCa;
  deadline: string;
  evidence?: string;
}

export interface UpdateCorrectiveActionDTO {
  status?: StatusCa;
  evidence?: string;
}
