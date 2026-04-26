import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NonConformityService } from '../../core/services/non-conformity.service';
import { ResponseNonConformityDTO } from '../../core/models/non-conformity.model';
import { StatusNc } from '../../core/models/status-nc.enum';
import { SeverityBadgeComponent } from '../../shared/components/severity-badge/severity-badge.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { OverdueBadgeComponent } from '../../shared/components/overdue-badge/overdue-badge.component';

@Component({
  selector: 'app-minha-fila-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SeverityBadgeComponent, StatusBadgeComponent, OverdueBadgeComponent],
  templateUrl: './minha-fila.page.html',
})
export class MinhaFilaPage {
  private auth = inject(AuthService);
  private svc = inject(NonConformityService);

  user = this.auth.currentUser;
  items = signal<ResponseNonConformityDTO[]>([]);

  overdue = computed(() =>
    this.items()
      .filter((n) => this.isOverdue(n))
      .sort((a, b) => +new Date(a.dueDate!) - +new Date(b.dueDate!)),
  );

  upcoming = computed(() =>
    this.items()
      .filter((n) => !this.isOverdue(n))
      .sort(
        (a, b) =>
          +new Date(a.dueDate ?? '2999-01-01') - +new Date(b.dueDate ?? '2999-01-01'),
      ),
  );

  constructor() {
    const userId = this.user()?.id;
    if (!userId) return;
    this.svc
      .list({ assignedToId: userId, pageSize: 100, order: 'ASC' })
      .subscribe((page) => this.items.set(page.items));
  }

  private isOverdue(n: ResponseNonConformityDTO): boolean {
    if (!n.dueDate || n.closedAt) return false;
    if (n.status === StatusNc.ENCERRADA || n.status === StatusNc.CANCELADA) return false;
    return new Date(n.dueDate).getTime() < Date.now();
  }
}
