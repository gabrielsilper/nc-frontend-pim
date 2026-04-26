import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { NonConformityService } from '../../core/services/non-conformity.service';
import { DashboardCountsDTO, RankingItemDTO } from '../../core/models/dashboard.model';
import { ResponseNonConformityDTO } from '../../core/models/non-conformity.model';
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
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, SeverityBadgeComponent, StatusBadgeComponent, OverdueBadgeComponent],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  private dashboardService = inject(DashboardService);
  private nonConformityService = inject(NonConformityService);

  counts = signal<DashboardCountsDTO | null>(null);
  recent = signal<RecentNc[]>([]);
  ranking = signal<RankingRow[]>([]);

  kpis = computed<KpiCard[]>(() => {
    const c = this.counts();
    return [
      { label: 'NCs ABERTAS',              value: c?.openNonConformities ?? '—',     accentCls: 'bg-nc-ink',      icon: 'list_alt',  iconCls: 'text-nc-ink' },
      { label: 'CRÍTICAS/ALTAS EM ABERTO', value: c?.warningNonConformities ?? '—',  accentCls: 'bg-nc-critical', icon: 'warning',   iconCls: 'text-nc-critical' },
      { label: 'PRAZO VENCIDO',            value: c?.expiredNonConformities ?? '—',  accentCls: 'bg-nc-accent',   icon: 'schedule',  iconCls: 'text-nc-accent' },
      { label: 'ENCERRADAS NO MÊS',        value: c?.closedNonConformities ?? '—',   accentCls: 'bg-nc-ok',       icon: 'task_alt',  iconCls: 'text-nc-ok' },
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
          isOverdue: this.isOverdue(n.dueDate, n.closedAt),
        })),
      );
    });
  }

  private formatBrDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  private isOverdue(dueDate?: string, closedAt?: string | null): boolean {
    if (!dueDate || closedAt) return false;
    return new Date(dueDate).getTime() < Date.now();
  }
}
