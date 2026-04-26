import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NcService } from '../../core/nc.service';
import { DashboardCountsDto, NonConformityDto, RankingItemDto } from '../../shared/models/dto';
import { SeverityBadgeComponent, StatusBadgeComponent, OverdueBadgeComponent } from '../../shared/ui/badges';

@Component({
  selector: 'nc-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SeverityBadgeComponent, StatusBadgeComponent, OverdueBadgeComponent],
  template: `
<div class="h-14 bg-white border-b border-nc-line px-6 flex items-center gap-6 flex-shrink-0">
  <div class="flex-1">
    <div class="font-mono text-[10px] text-nc-muted uppercase tracking-widest mb-0.5">Dashboard</div>
    <h1 class="text-[17px] font-semibold m-0 -tracking-[0.003em]">Visão geral — Qualidade</h1>
  </div>
  <div class="font-mono text-[11px] text-nc-ink-3 tracking-wide">TURNO <span class="text-nc-ink">2/3</span> · 24/04/2026 · 14:42</div>
  <a routerLink="/app/ncs/nova" class="px-3.5 py-1.5 bg-nc-accent text-white text-xs font-medium rounded-sm">+ Nova NC</a>
</div>

<div class="flex-1 overflow-auto p-6">
  <!-- KPIs -->
  <div class="grid grid-cols-4 gap-3 mb-5">
    @for (k of kpis(); track k.label) {
      <div class="relative bg-white border border-nc-line p-4 rounded-sm overflow-hidden">
        <div class="absolute left-0 top-0 bottom-0 w-[3px]" [class]="k.accentCls"></div>
        <div class="font-mono text-[10px] text-nc-ink-3 tracking-widest mb-2.5">{{ k.label }}</div>
        <div class="font-mono text-[38px] font-semibold -tracking-[0.04em] leading-none">{{ k.value }}</div>
        <div class="font-mono text-[11px] mt-2.5" [class]="k.deltaCls">{{ k.delta }}</div>
      </div>
    }
  </div>

  <!-- Main + side -->
  <div class="grid grid-cols-[1fr_360px] gap-4">
    <div class="bg-white border border-nc-line rounded-sm">
      <div class="flex justify-between items-center px-[18px] py-3.5 border-b border-nc-line">
        <div>
          <div class="text-sm font-semibold">NCs recentes</div>
          <div class="font-mono text-[10px] text-nc-muted uppercase tracking-wider mt-0.5">Últimas 10 · ordenado por abertura</div>
        </div>
        <a routerLink="/app/ncs" class="text-xs text-nc-ink-2 underline">Ver todas →</a>
      </div>
      <table class="w-full text-[12.5px] border-collapse">
        <thead class="bg-[#FAFBFC] font-mono text-[10px] text-nc-ink-3 tracking-wider uppercase">
          <tr>
            <th class="text-left px-3.5 py-2 font-medium">Número</th>
            <th class="text-left px-3.5 py-2 font-medium">Título</th>
            <th class="text-left px-3.5 py-2 font-medium">Linha</th>
            <th class="text-left px-3.5 py-2 font-medium">Grav.</th>
            <th class="text-left px-3.5 py-2 font-medium">Status</th>
            <th class="text-right px-3.5 py-2 font-medium">Aberta há</th>
          </tr>
        </thead>
        <tbody>
          @for (n of recent(); track n.id) {
            <tr class="border-t border-nc-line hover:bg-[#FAFBFC] cursor-pointer" [routerLink]="['/app/ncs', n.id]">
              <td class="px-3.5 py-2.5 font-mono text-[11.5px]">{{ n.number }}</td>
              <td class="px-3.5 py-2.5 max-w-[320px] truncate">{{ n.title }}</td>
              <td class="px-3.5 py-2.5 font-mono text-[11.5px] text-nc-ink-3">{{ n.processLine }}</td>
              <td class="px-3.5 py-2.5"><nc-severity-badge [severity]="n.severity"/></td>
              <td class="px-3.5 py-2.5"><nc-status-badge [status]="n.status"/></td>
              <td class="px-3.5 py-2.5 text-right font-mono text-[11.5px] text-nc-ink-3">{{ n.ageLabel }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <div class="flex flex-col gap-4">
      <div class="bg-white border border-nc-line rounded-sm">
        <div class="px-[18px] py-3.5 border-b border-nc-line">
          <div class="text-sm font-semibold">Recorrência por tipo</div>
          <div class="font-mono text-[10px] text-nc-muted uppercase tracking-wider mt-0.5">Abril 2026 · top 3</div>
        </div>
        <div class="py-2">
          @for (r of ranking(); track r.type; let i = $index) {
            <div class="px-[18px] py-3">
              <div class="flex justify-between items-baseline mb-1.5">
                <div class="flex gap-2.5 items-baseline">
                  <span class="font-mono text-[11px] text-nc-muted w-[18px]">{{ i + 1 | number:'2.0-0' }}</span>
                  <span class="text-[13px] font-medium">{{ r.type }}</span>
                </div>
                <span class="font-mono text-[18px] font-semibold">{{ r.count }}</span>
              </div>
              <div class="h-1.5 bg-[#F1F5F9] relative">
                <div class="absolute left-0 top-0 bottom-0 bg-nc-ink" [style.width.%]="r.barPct"></div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  </div>
</div>
  `,
})
export class DashboardComponent {
  private svc = inject(NcService);

  counts = signal<DashboardCountsDto | null>(null);
  recent = signal<(NonConformityDto & { ageLabel: string })[]>([]);
  ranking = signal<(RankingItemDto & { barPct: number })[]>([]);

  kpis = computed(() => {
    const c = this.counts();
    return [
      { label: 'NCs ABERTAS',               value: c?.open ?? '—',               delta: '+3 vs. semana', accentCls: 'bg-nc-ink',       deltaCls: 'text-nc-ink-3' },
      { label: 'CRÍTICAS/ALTAS EM ABERTO',  value: c?.criticalOrHighOpen ?? '—', delta: '2 sem responsável', accentCls: 'bg-nc-critical', deltaCls: 'text-nc-critical' },
      { label: 'PRAZO VENCIDO',             value: c?.overdue ?? '—',            delta: 'ação imediata',    accentCls: 'bg-nc-accent',   deltaCls: 'text-nc-accent' },
      { label: 'ENCERRADAS EM ABRIL',       value: c?.closedThisMonth ?? '—',    delta: '+18% vs. março',   accentCls: 'bg-nc-ok',       deltaCls: 'text-nc-ok' },
    ];
  });

  constructor() {
    this.svc.dashboardCounts().subscribe(c => this.counts.set(c));
    this.svc.list({ page: 1, pageSize: 10 }).subscribe(p => {
      this.recent.set(p.items.map(n => ({ ...n, ageLabel: this.ageLabel(n.openedAt) })));
    });
    this.svc.dashboardRanking(3).subscribe(r => {
      const max = Math.max(1, ...r.map(x => x.count));
      this.ranking.set(r.map(x => ({ ...x, barPct: (x.count / max) * 100 })));
    });
  }

  private ageLabel(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diffMs / 3600000);
    if (h < 1) return `${Math.floor(diffMs / 60000)} min`;
    if (h < 48) return `${h} h`;
    return `${Math.floor(h / 24)} d`;
  }
}
