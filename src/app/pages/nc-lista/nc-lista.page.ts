import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NonConformityService } from '../../core/services/non-conformity.service';
import { NcFilterStateService } from '../../core/services/nc-filter-state.service';
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
  private router = inject(Router);
  private filters = inject(NcFilterStateService);

  // Getters/setters para compatibilidade com [(ngModel)]
  get search() { return this.filters.search(); }
  set search(val: string) { this.filters.search.set(val); }

  get statusFilter() { return this.filters.statusFilter(); }
  set statusFilter(val: StatusNc | null) { this.filters.statusFilter.set(val); }

  get severityFilter() { return this.filters.severityFilter(); }
  set severityFilter(val: SeverityNc | null) { this.filters.severityFilter.set(val); }

  get typeFilter() { return this.filters.typeFilter(); }
  set typeFilter(val: TypeNc | null) { this.filters.typeFilter.set(val); }

  get expiredFilter() { return this.filters.expiredFilter(); }
  set expiredFilter(val: 0 | 1 | null) { this.filters.expiredFilter.set(val); }

  // Aliases diretos dos sinais do serviço
  currentPage = this.filters.currentPage;
  pageSize = this.filters.pageSize;
  order = this.filters.order;

  pageData = signal<ResponseNonConformitiesPageDTO | null>(null);

  items = computed<NcRow[]>(() =>
    (this.pageData()?.items ?? []).map((n) => ({
      ...n,
      openedAtLabel: this.formatBrDate(n.openedAt),
      dueDateLabel: n.dueDate ? this.formatBrDate(n.dueDate) : undefined,
      isOverdue: this.isOverdue(n.dueDate, n.status, n.closedAt),
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
    const nav = this.router.getCurrentNavigation();
    const keep = nav?.extras?.state?.['keepFilters'] === true || nav?.trigger === 'popstate';
    if (!keep) {
      this.filters.clear();
    }
    this.load();
  }

  load() {
    this.svc.list({
      page: this.filters.currentPage(),
      pageSize: this.filters.pageSize(),
      order: this.filters.order(),
      search: this.filters.search() || undefined,
      status: this.filters.statusFilter() ?? undefined,
      severity: this.filters.severityFilter() ?? undefined,
      type: this.filters.typeFilter() ?? undefined,
      expired: this.filters.expiredFilter() ?? undefined,
    }).subscribe((data) => this.pageData.set(data));
  }

  applyFilters() {
    this.filters.currentPage.set(1);
    this.load();
  }

  clear() {
    this.filters.clear();
    this.load();
  }

  prevPage() {
    if (this.hasPrev()) {
      this.filters.currentPage.update((p) => p - 1);
      this.load();
    }
  }

  nextPage() {
    if (this.hasNext()) {
      this.filters.currentPage.update((p) => p + 1);
      this.load();
    }
  }

  changePageSize(size: number) {
    this.filters.pageSize.set(size);
    this.filters.currentPage.set(1);
    this.load();
  }

  toggleOrder() {
    this.filters.order.update((o) => (o === 'DESC' ? 'ASC' : 'DESC'));
    this.filters.currentPage.set(1);
    this.load();
  }

  private formatBrDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  private isOverdue(dueDate?: string, status?: StatusNc, closedAt?: string | null): boolean {
    if (!dueDate || closedAt) return false;
    if (status === undefined || status === null || status === StatusNc.CANCELADA) return false;
    return new Date(dueDate).getTime() < Date.now();
  }
}
