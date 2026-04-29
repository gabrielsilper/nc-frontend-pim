import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Profile, PROFILE_LABEL } from '../../core/models/profile.enum';
import { ResponseUserDTO } from '../../core/models/user.model';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.page.html',
})
export class PerfilPage {
  private auth = inject(AuthService);

  loading = signal(false);
  error = signal('');
  user = signal<ResponseUserDTO | null>(null);

  initials = computed(() => {
    const name = this.user()?.name?.trim();
    if (!name) return '?';
    const parts = name.split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  });

  profileLabel = computed(() => {
    const profile = this.user()?.profile;
    return profile !== undefined ? PROFILE_LABEL[profile] : '';
  });

  accessLabel = computed(() => {
    switch (this.user()?.profile) {
      case Profile.GESTOR:
        return 'Acesso administrativo com visibilidade completa do sistema.';
      case Profile.RESPONSAVEL:
        return 'Acesso operacional para acompanhar a fila e executar tratativas atribuídas.';
      case Profile.OPERADOR:
        return 'Acesso de registro e acompanhamento básico das não conformidades.';
      default:
        return '';
    }
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.auth.me().subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar o perfil. Tente novamente.');
        this.loading.set(false);
      },
    });
  }
}
