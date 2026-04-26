import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NonConformityService } from '../../core/services/non-conformity.service';
import { ResponseNonConformitiesPageDTO, ResponseNonConformityDTO } from '../../core/models/non-conformity.model';
import { SeverityNc, SEVERITY_LABEL } from '../../core/models/severity-nc.enum';
import { StatusNc, STATUS_LABEL } from '../../core/models/status-nc.enum';
import { TypeNc, TYPE_LABEL } from '../../core/models/type-nc.enum';
import { SeverityBadgeComponent } from '../../shared/components/severity-badge/severity-badge.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { OverdueBadgeComponent } from '../../shared/components/overdue-badge/overdue-badge.component';

interface NcRow extends ResponseNonConformityDTO {
  openedAtLabel: string;
  dueDateLabel?: string;
  isOverdue: boolean;
}

@Component({
  selector: 'app-nc-lista-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SeverityBadgeComponent, StatusBadgeComponent, OverdueBadgeComponent],
  templateUrl: './nc-lista.page.html',
})
export class NcListaPage {
  private svc = inject(NonConformityService);

  search = '';
  statusFilter: StatusNc | null = null;
  severityFilter: SeverityNc | null = null;
  typeFilter: TypeNc | null = null;
  expiredFilter: 0 | 1 | null = null;

  currentPage = signal(1);
  pageSize = signal(20);
  order = signal<'ASC' | 'DESC'>('DESC');

  pageData = signal<ResponseNonConformitiesPageDTO | null>(null);

  items = computed<NcRow[]>(() =>
    (this.pageData()?.items ?? []).map((n) => ({
      ...n,
      openedAtLabel: this.formatBrDate(n.openedAt),
      dueDateLabel: n.dueDate ? this.formatBrDate(n.dueDate) : undefined,
      isOverdue: this.isOverdue(n.dueDate, n.closedAt),
    })),
  );

  total = computed(() => this.pageData()?.total ?? 0);
  totalPages = computed(() => this.pageData()?.totalPages ?? 1);
  hasPrev = computed(() => this.currentPage() > 1);
  hasNext = computed(() => this.currentPage() < this.totalPages());

  statuses = Object.values(StatusNc).filter((v): v is StatusNc => typeof v === 'number');
  severities = Object.values(SeverityNc).filter((v): v is SeverityNc => typeof v === 'number');
  types = Object.values(TypeNc).filter((v): v is TypeNc => typeof v === 'number');

  statusLabel = (s: StatusNc) => STATUS_LABEL[s];
  severityLabel = (s: SeverityNc) => SEVERITY_LABEL[s];
  typeLabel = (t: TypeNc) => TYPE_LABEL[t];

  pageSizeOptions = [10, 20, 50];

  constructor() {
    this.load();
  }

  load() {
    this.svc.list({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      order: this.order(),
      search: this.search || undefined,
      status: this.statusFilter ?? undefined,
      severity: this.severityFilter ?? undefined,
      type: this.typeFilter ?? undefined,
      expired: this.expiredFilter ?? undefined,
    }).subscribe((data) => this.pageData.set(data));
  }

  applyFilters() {
    this.currentPage.set(1);
    this.load();
  }

  clear() {
    this.search = '';
    this.statusFilter = null;
    this.severityFilter = null;
    this.typeFilter = null;
    this.expiredFilter = null;
    this.currentPage.set(1);
    this.load();
  }

  prevPage() {
    if (this.hasPrev()) {
      this.currentPage.update((p) => p - 1);
      this.load();
    }
  }

  nextPage() {
    if (this.hasNext()) {
      this.currentPage.update((p) => p + 1);
      this.load();
    }
  }

  changePageSize(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.load();
  }

  toggleOrder() {
    this.order.update((o) => (o === 'DESC' ? 'ASC' : 'DESC'));
    this.currentPage.set(1);
    this.load();
  }

  private formatBrDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  private isOverdue(dueDate?: string, closedAt?: string | null): boolean {
    if (!dueDate || closedAt) return false;
    return new Date(dueDate).getTime() < Date.now();
  }
}
