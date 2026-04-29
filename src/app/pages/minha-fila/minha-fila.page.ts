import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NonConformityService } from '../../core/services/non-conformity.service';
import { ResponseNonConformityDTO } from '../../core/models/non-conformity.model';
import { allowedStatusTransitions, STATUS_LABEL, StatusNc } from '../../core/models/status-nc.enum';
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
  updatingStatusId = signal<string | null>(null);
  statusError = signal('');

  overdue = computed(() =>
    this.activeItems()
      .filter((n) => this.isOverdue(n))
      .sort((a, b) => +new Date(a.dueDate!) - +new Date(b.dueDate!)),
  );

  upcoming = computed(() =>
    this.activeItems()
      .filter((n) => !this.isOverdue(n))
      .sort(
        (a, b) =>
          +new Date(a.dueDate ?? '2999-01-01') - +new Date(b.dueDate ?? '2999-01-01'),
      ),
  );

  constructor() {
    this.svc.myQueue().subscribe((items) => this.items.set(items));
  }

  nextStatus(n: ResponseNonConformityDTO): StatusNc | null {
    return allowedStatusTransitions(n.status).find((status) => status !== StatusNc.CANCELADA) ?? null;
  }

  quickActionLabel(n: ResponseNonConformityDTO): string {
    const next = this.nextStatus(n);
    return next === null ? 'Sem próxima etapa' : `Avançar para ${STATUS_LABEL[next]}`;
  }

  advance(n: ResponseNonConformityDTO) {
    const next = this.nextStatus(n);
    if (next === null) return;

    this.statusError.set('');
    this.updatingStatusId.set(n.id);
    this.svc.updateStatus(n.id, next).subscribe({
      next: (updated) => {
        this.items.update((items) => items.map((item) => (item.id === updated.id ? updated : item)));
        this.updatingStatusId.set(null);
      },
      error: (e: HttpErrorResponse) => {
        this.statusError.set(e.error?.message ?? 'Erro ao atualizar status da NC.');
        this.updatingStatusId.set(null);
      },
    });
  }

  private activeItems() {
    return this.items().filter((n) => this.isQueueItem(n));
  }

  private isQueueItem(n: ResponseNonConformityDTO): boolean {
    return n.status !== StatusNc.ENCERRADA && n.status !== StatusNc.CANCELADA;
  }

  private isOverdue(n: ResponseNonConformityDTO): boolean {
    if (!n.dueDate || n.closedAt || !this.isQueueItem(n)) return false;
    return new Date(n.dueDate).getTime() < Date.now();
  }
}
