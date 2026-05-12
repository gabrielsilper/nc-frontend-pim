import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { NonConformityService } from '../../core/services/non-conformity.service';
import { NcFilterStateService } from '../../core/services/nc-filter-state.service';
import { DashboardCountsDTO, RankingItemDTO } from '../../core/models/dashboard.model';
import { ResponseNonConformityDTO } from '../../core/models/non-conformity.model';
import { SeverityNc } from '../../core/models/severity-nc.enum';
import { StatusNc } from '../../core/models/status-nc.enum';
import { SeverityBadgeComponent } from '../../shared/components/severity-badge/severity-badge.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { OverdueBadgeComponent } from '../../shared/components/overdue-badge/overdue-badge.component';

interface RecentNc extends ResponseNonConformityDTO {
  openedAtLabel: string;
  dueDateLabel?: string;
  isOverdue: boolean;
}

interface RankingRow extends RankingItemDTO {
  barPct: number;
}

interface KpiCard {
  label: string;
  value: number | string;
  accentCls: string;
  icon: string;
  iconCls: string;
  clickFn: () => void;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SeverityBadgeComponent, StatusBadgeComponent, OverdueBadgeComponent],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  private dashboardService = inject(DashboardService);
  private nonConformityService = inject(NonConformityService);
  private ncFilters = inject(NcFilterStateService);
  private router = inject(Router);

  counts = signal<DashboardCountsDTO | null>(null);
  recent = signal<RecentNc[]>([]);
  ranking = signal<RankingRow[]>([]);

  kpis = computed<KpiCard[]>(() => {
    const c = this.counts();
    return [
      {
        label: 'ABERTAS',
        value: c?.openNonConformities ?? '—',
        accentCls: 'bg-nc-ink',
        icon: 'list_alt',
        iconCls: 'text-nc-ink',
        clickFn: () => this.goToList({ status: StatusNc.ABERTA }),
      },
      {
        label: 'CRÍTICAS/ALTAS EM ABERTO',
        value: c?.warningNonConformities ?? '—',
        accentCls: 'bg-nc-critical',
        icon: 'warning',
        iconCls: 'text-nc-critical',
        clickFn: () => this.goToList({ severity: SeverityNc.CRITICA }),
      },
      {
        label: 'PRAZO VENCIDO',
        value: c?.expiredNonConformities ?? '—',
        accentCls: 'bg-nc-accent',
        icon: 'schedule',
        iconCls: 'text-nc-accent',
        clickFn: () => this.goToList({ expired: 1 }),
      },
      {
        label: 'ENCERRADAS NO MÊS',
        value: c?.closedNonConformities ?? '—',
        accentCls: 'bg-nc-ok',
        icon: 'task_alt',
        iconCls: 'text-nc-ok',
        clickFn: () => this.goToList({ status: StatusNc.ENCERRADA }),
      },
    ];
  });

  expiredCount = computed(() => this.counts()?.expiredNonConformities ?? 0);

  constructor() {
    this.dashboardService.counts().subscribe((c) => this.counts.set(c));

    this.dashboardService.ranking(3).subscribe((items) => {
      const max = Math.max(1, ...items.map((x) => x.total));
      this.ranking.set(items.map((x) => ({ ...x, barPct: (x.total / max) * 100 })));
    });

    this.nonConformityService.list({ page: 1, pageSize: 10, order: 'DESC' }).subscribe((page) => {
      this.recent.set(
        page.items.map((n) => ({
          ...n,
          openedAtLabel: this.formatBrDate(n.openedAt),
          dueDateLabel: n.dueDate ? this.formatBrDate(n.dueDate) : undefined,
          isOverdue: this.isOverdue(n.dueDate, n.status, n.closedAt),
        })),
      );
    });
  }

  reviewExpired() {
    this.goToList({ expired: 1 });
  }

  private goToList(filters: { status?: StatusNc; severity?: SeverityNc; expired?: 0 | 1 }) {
    this.ncFilters.clear();
    if (filters.status !== undefined) this.ncFilters.statusFilter.set(filters.status);
    if (filters.severity !== undefined) this.ncFilters.severityFilter.set(filters.severity);
    if (filters.expired !== undefined) this.ncFilters.expiredFilter.set(filters.expired);
    this.router.navigate(['/app/ncs'], { state: { keepFilters: true } });
  }

  private formatBrDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  private isOverdue(dueDate?: string, status?: StatusNc, closedAt?: string | null): boolean {
    if (!dueDate || closedAt) return false;
    if (!status || status === StatusNc.CANCELADA) return false;
    return new Date(dueDate).getTime() < Date.now();
  }
}
