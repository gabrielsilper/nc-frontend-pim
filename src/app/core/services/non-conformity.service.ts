import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  CreateCorrectiveActionDTO,
  CreateNonConformityDTO,
  FindNonConformitiesQuery,
  ResponseCorrectiveActionDTO,
  ResponseNonConformitiesPageDTO,
  ResponseNonConformityDTO,
  UpdateNonConformityDTO,
} from '../models/non-conformity.model';
import { StatusNc } from '../models/status-nc.enum';

@Injectable({ providedIn: 'root' })
export class NonConformityService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/non-conformities`;

  list(query: FindNonConformitiesQuery = {}) {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', query.page);
    if (query.pageSize !== undefined) params = params.set('pageSize', query.pageSize);
    if (query.order !== undefined) params = params.set('order', query.order);
    if (query.search) params = params.set('search', query.search);
    if (query.status !== undefined) params = params.set('status', query.status);
    if (query.severity !== undefined) params = params.set('severity', query.severity);
    if (query.type !== undefined) params = params.set('type', query.type);
    if (query.expired !== undefined) params = params.set('expired', query.expired);

    return this.http.get<ResponseNonConformitiesPageDTO>(this.base, { params });
  }

  byId(id: string) {
    return this.http.get<ResponseNonConformityDTO>(`${this.base}/${id}`);
  }

  create(dto: CreateNonConformityDTO) {
    return this.http.post<ResponseNonConformityDTO>(this.base, dto);
  }

  update(id: string, dto: UpdateNonConformityDTO) {
    return this.http.put<ResponseNonConformityDTO>(`${this.base}/${id}`, dto);
  }

  updateStatus(id: string, status: StatusNc) {
    return this.http.patch<ResponseNonConformityDTO>(`${this.base}/${id}/status/${status}`, {});
  }

  assign(id: string, userId: string) {
    return this.http.patch<ResponseNonConformityDTO>(`${this.base}/${id}/assign/${userId}`, {});
  }

  updateDueDate(id: string, date: string) {
    return this.http.patch<ResponseNonConformityDTO>(`${this.base}/${id}/due-date/${date}`, {});
  }

  correctiveActions(ncId: string) {
    return this.http.get<ResponseCorrectiveActionDTO[]>(`${this.base}/${ncId}/corrective-actions`);
  }

  createCorrectiveAction(ncId: string, dto: CreateCorrectiveActionDTO) {
    return this.http.post<ResponseCorrectiveActionDTO>(`${this.base}/${ncId}/corrective-actions`, dto);
  }
}
