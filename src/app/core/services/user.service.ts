import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateUserDTO, ResponseUserDTO, UpdateUserDTO } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  byId(id: string) {
    return this.http.get<ResponseUserDTO>(`${this.base}/${id}`);
  }

  listAll(params?: { profile?: number; search?: string }) {
    let httpParams = new HttpParams();
    if (params?.profile !== undefined) httpParams = httpParams.set('profile', params.profile);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<ResponseUserDTO[]>(this.base, { params: httpParams });
  }

  create(dto: CreateUserDTO) {
    return this.http.post<ResponseUserDTO>(this.base, dto);
  }

  update(id: string, dto: UpdateUserDTO) {
    return this.http.put<ResponseUserDTO>(`${this.base}/${id}`, dto);
  }
}
