import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LoginDto, TokensDto, UserDto } from '../shared/models/dto';
import { Profile } from '../shared/models/enums';

const API = '/api/v1';
const TOKEN_KEY = 'nc.accessToken';
const REFRESH_KEY = 'nc.refreshToken';
const USER_KEY = 'nc.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Signals-based reactive state
  readonly user = signal<UserDto | null>(this.readStoredUser());
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly isManager = computed(() => this.user()?.profile === Profile.GESTOR);

  accessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  async login(dto: LoginDto): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ tokens: TokensDto; user: UserDto }>(`${API}/auth/login`, dto),
    );
    localStorage.setItem(TOKEN_KEY, res.tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, res.tokens.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.user.set(res.user);
    this.router.navigateByUrl('/app/dashboard');
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
    this.router.navigateByUrl('/login');
  }

  private readStoredUser(): UserDto | null {
    const raw = localStorage.getItem(USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
}
