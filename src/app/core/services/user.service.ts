import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateUserDTO, ResponseUserDTO, UpdateUserDTO } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  byId(id: string) {
    return this.http.get<ResponseUserDTO>(`${this.base}/${id}`);
  }

  listAll() {
    return this.http.get<ResponseUserDTO[]>(this.base);
  }

  create(dto: CreateUserDTO) {
    return this.http.post<ResponseUserDTO>(this.base, dto);
  }

  update(id: string, dto: UpdateUserDTO) {
    return this.http.put<ResponseUserDTO>(`${this.base}/${id}`, dto);
  }
}
