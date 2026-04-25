import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PROFILE_LABEL } from '../../../core/models/profile.enum';

@Component({
  selector: 'nc-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private auth = inject(AuthService);

  user = this.auth.currentUser;

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

  logout(): void {
    this.auth.logout();
  }
}
