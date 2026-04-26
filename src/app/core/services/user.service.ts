import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ResponseUserDTO } from '../models/user.model';

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
}
