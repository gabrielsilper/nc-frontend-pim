import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DashboardCountsDTO, RankingItemDTO } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  counts() {
    return this.http.get<DashboardCountsDTO>(
      `${environment.apiUrl}/non-conformities/counts`,
    );
  }

  ranking(limit = 3) {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<RankingItemDTO[]>(
      `${environment.apiUrl}/non-conformities/ranking`,
      { params },
    );
  }
}
