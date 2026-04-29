import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Profile, PROFILE_LABEL } from '../../core/models/profile.enum';
import { ResponseUserDTO } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';

interface ProfileOption {
  value: Profile;
  label: string;
}

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './usuarios.page.html',
})
export class UsuariosPage {
  private userService = inject(UserService);

  users = signal<ResponseUserDTO[]>([]);
  loading = signal(false);
  error = signal('');
  search = signal('');
  profileFilter = signal<Profile | null>(null);
  draftSearch = '';
  draftProfileFilter: Profile | null = null;

  profileOptions: ProfileOption[] = Object.values(Profile)
    .filter((value): value is Profile => typeof value === 'number')
    .map((value) => ({ value, label: PROFILE_LABEL[value] }));

  filteredUsers = computed(() => {
    const term = this.normalize(this.search());
    const profile = this.profileFilter();

    return this.users().filter((user) => {
      const matchesText =
        !term ||
        this.normalize(user.name).includes(term) ||
        this.normalize(user.email).includes(term) ||
        this.normalize(PROFILE_LABEL[user.profile]).includes(term);

      const matchesProfile = profile === null || user.profile === profile;

      return matchesText && matchesProfile;
    });
  });

  total = computed(() => this.users().length);
  filteredTotal = computed(() => this.filteredUsers().length);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.userService.listAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os usuários. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  updateSearch(value: string): void {
    this.draftSearch = value;
  }

  updateProfileFilter(value: Profile | null): void {
    this.draftProfileFilter = value;
  }

  applyFilters(): void {
    this.search.set(this.draftSearch);
    this.profileFilter.set(this.draftProfileFilter);
  }

  clearFilters(): void {
    this.draftSearch = '';
    this.draftProfileFilter = null;
    this.search.set('');
    this.profileFilter.set(null);
  }

  profileLabel(profile: Profile): string {
    return PROFILE_LABEL[profile];
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || '?';
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
