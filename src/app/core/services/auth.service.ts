import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginDTO, ResponseTokensDTO } from '../models/auth.model';
import { AuthUserDTO, ResponseUserDTO } from '../models/user.model';
import { Profile } from '../models/profile.enum';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

interface JwtPayload {
  sub: string;
  email: string;
  profile: Profile;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<AuthUserDTO | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());

  login(data: LoginDTO) {
    return this.http
      .post<ResponseTokensDTO>(`${environment.apiUrl}/auth/login`, data)
      .pipe(
        tap((response) => {
          localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        }),
        switchMap(() => this.me()),
      );
  }

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  loadUserFromToken(): void {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;

    const payload = this.decodeToken(token);
    if (!payload || this.isExpired(payload)) {
      this.logout();
      return;
    }

    this.currentUser.set({ id: payload.sub, profile: payload.profile });
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  me() {
    return this.http
      .get<ResponseUserDTO>(`${environment.apiUrl}/auth/me`)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const base64Payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64Payload)) as JwtPayload;
    } catch {
      return null;
    }
  }

  private isExpired(payload: JwtPayload): boolean {
    return Date.now() >= payload.exp * 1000;
  }
}
