import { SeverityNc } from './severity-nc.enum';
import { StatusNc } from './status-nc.enum';
import { TypeNc } from './type-nc.enum';

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
  createdById: string;
  assignedToId?: string;
  assignedTo?: { id: string; name: string };
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
}
