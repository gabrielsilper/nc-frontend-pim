import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CorrectiveActionDto, CreateNonConformityDto, DashboardCountsDto,
  NonConformityDto, PageDto, RankingItemDto,
} from '../shared/models/dto';
import { SeverityNc, StatusNc, TypeNc } from '../shared/models/enums';

const API = '/api/v1';

export interface NcFilters {
  status?: StatusNc[];
  severity?: SeverityNc[];
  type?: TypeNc[];
  q?: string;
  page?: number;
  pageSize?: number;
  assignedToMe?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NcService {
  private http = inject(HttpClient);

  list(filters: NcFilters = {}): Observable<PageDto<NonConformityDto>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(x => params = params.append(k, String(x)));
      else if (v !== undefined) params = params.set(k, String(v));
    });
    return this.http.get<PageDto<NonConformityDto>>(`${API}/ncs`, { params });
  }

  byId(id: string): Observable<NonConformityDto> {
    return this.http.get<NonConformityDto>(`${API}/ncs/${id}`);
  }

  create(dto: CreateNonConformityDto): Observable<NonConformityDto> {
    return this.http.post<NonConformityDto>(`${API}/ncs`, dto);
  }

  assign(id: string, userId: string): Observable<NonConformityDto> {
    return this.http.patch<NonConformityDto>(`${API}/ncs/${id}/assign/${userId}`, {});
  }

  updateStatus(id: string, status: StatusNc): Observable<NonConformityDto> {
    return this.http.patch<NonConformityDto>(`${API}/ncs/${id}/status/${status}`, {});
  }

  updateDueDate(id: string, isoDate: string): Observable<NonConformityDto> {
    return this.http.patch<NonConformityDto>(`${API}/ncs/${id}/due-date/${isoDate}`, {});
  }

  dashboardCounts(): Observable<DashboardCountsDto> {
    return this.http.get<DashboardCountsDto>(`${API}/ncs/dashboard/counts`);
  }

  dashboardRanking(limit = 3): Observable<RankingItemDto[]> {
    return this.http.get<RankingItemDto[]>(`${API}/ncs/dashboard/ranking`, {
      params: new HttpParams().set('limit', limit),
    });
  }

  correctiveActions(ncId: string): Observable<CorrectiveActionDto[]> {
    return this.http.get<CorrectiveActionDto[]>(`${API}/ncs/${ncId}/actions`);
  }
}
