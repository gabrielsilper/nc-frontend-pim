import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  CreateNonConformityDTO,
  FindNonConformitiesQuery,
  ResponseNonConformitiesPageDTO,
  ResponseNonConformityDTO,
} from '../models/non-conformity.model';

@Injectable({ providedIn: 'root' })
export class NonConformityService {
  private http = inject(HttpClient);

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

    return this.http.get<ResponseNonConformitiesPageDTO>(
      `${environment.apiUrl}/non-conformities`,
      { params },
    );
  }

  create(dto: CreateNonConformityDTO) {
    return this.http.post<ResponseNonConformityDTO>(
      `${environment.apiUrl}/non-conformities`,
      dto,
    );
  }
}
