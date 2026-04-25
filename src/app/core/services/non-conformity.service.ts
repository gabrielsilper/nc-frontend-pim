import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  FindNonConformitiesQuery,
  ResponseNonConformitiesPageDTO,
} from '../models/non-conformity.model';

@Injectable({ providedIn: 'root' })
export class NonConformityService {
  private http = inject(HttpClient);

  list(query: FindNonConformitiesQuery = {}) {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', query.page);
    if (query.pageSize !== undefined) params = params.set('pageSize', query.pageSize);
    if (query.order !== undefined) params = params.set('order', query.order);

    return this.http.get<ResponseNonConformitiesPageDTO>(
      `${environment.apiUrl}/non-conformities`,
      { params },
    );
  }
}
