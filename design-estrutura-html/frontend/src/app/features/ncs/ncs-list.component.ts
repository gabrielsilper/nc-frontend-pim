import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NcService, NcFilters } from '../../core/nc.service';
import { NonConformityDto, PageDto } from '../../shared/models/dto';
import { SeverityNc, StatusNc, TypeNc, STATUS_LABEL, SEVERITY_LABEL, TYPE_LABEL } from '../../shared/models/enums';
import { SeverityBadgeComponent, StatusBadgeComponent, OverdueBadgeComponent } from '../../shared/ui/badges';

@Component({
  selector: 'nc-ncs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SeverityBadgeComponent, StatusBadgeComponent, OverdueBadgeComponent],
  template: `
<div class="h-14 bg-white border-b border-nc-line px-6 flex items-center gap-6 flex-shrink-0">
  <div class="flex-1">
    <div class="font-mono text-[10px] text-nc-muted uppercase tracking-widest mb-0.5">Registros</div>
    <h1 class="text-[17px] font-semibold m-0">Não Conformidades</h1>
  </div>
  <div class="font-mono text-[11px] text-nc-ink-3">{{ page()?.total || 0 }} registros</div>
  <a routerLink="/app/ncs/nova" class="px-3.5 py-1.5 bg-nc-accent text-white text-xs font-medium rounded-sm">+ Nova NC</a>
</div>

<div class="flex-1 overflow-auto p-6">
  <!-- Filtros -->
  <div class="bg-white border border-nc-line rounded-sm p-3 mb-4 flex flex-wrap items-center gap-3">
    <input [(ngModel)]="q" (ngModelChange)="refresh()"
           placeholder="Buscar por número ou título…"
           class="flex-1 min-w-[260px] px-3 py-1.5 border border-nc-line-strong text-[13px] rounded-sm outline-none focus:border-nc-ink"/>
    <select [(ngModel)]="statusFilter" (ngModelChange)="refresh()" class="px-2.5 py-1.5 border border-nc-line-strong text-[12.5px] rounded-sm bg-white">
      <option [ngValue]="null">Todos os status</option>
      @for (s of statuses; track s) { <option [ngValue]="s">{{ statusLabel(s) }}</option> }
    </select>
    <select [(ngModel)]="severityFilter" (ngModelChange)="refresh()" class="px-2.5 py-1.5 border border-nc-line-strong text-[12.5px] rounded-sm bg-white">
      <option [ngValue]="null">Todas as gravidades</option>
      @for (s of severities; track s) { <option [ngValue]="s">{{ severityLabel(s) }}</option> }
    </select>
    <select [(ngModel)]="typeFilter" (ngModelChange)="refresh()" class="px-2.5 py-1.5 border border-nc-line-strong text-[12.5px] rounded-sm bg-white">
      <option [ngValue]="null">Todos os tipos</option>
      @for (t of types; track t) { <option [ngValue]="t">{{ typeLabel(t) }}</option> }
    </select>
    <button (click)="clear()" class="text-[11.5px] text-nc-ink-2 underline">Limpar filtros</button>
  </div>

  <div class="bg-white border border-nc-line rounded-sm">
    <table class="w-full text-[12.5px] border-collapse">
      <thead class="bg-[#FAFBFC] font-mono text-[10px] text-nc-ink-3 uppercase tracking-wider">
        <tr>
          <th class="text-left px-3.5 py-2 font-medium">Número</th>
          <th class="text-left px-3.5 py-2 font-medium">Título</th>
          <th class="text-left px-3.5 py-2 font-medium">Tipo</th>
          <th class="text-left px-3.5 py-2 font-medium">Grav.</th>
          <th class="text-left px-3.5 py-2 font-medium">Status</th>
          <th class="text-left px-3.5 py-2 font-medium">Responsável</th>
          <th class="text-right px-3.5 py-2 font-medium">Prazo</th>
        </tr>
      </thead>
      <tbody>
        @for (n of items(); track n.id) {
          <tr class="border-t border-nc-line hover:bg-[#FAFBFC] cursor-pointer" [routerLink]="['/app/ncs', n.id]">
            <td class="px-3.5 py-2.5 font-mono text-[11.5px]">{{ n.number }}</td>
            <td class="px-3.5 py-2.5 max-w-[340px] truncate">{{ n.title }}</td>
            <td class="px-3.5 py-2.5 text-[11.5px]">{{ typeLabel(n.type) }}</td>
            <td class="px-3.5 py-2.5"><nc-severity-badge [severity]="n.severity"/></td>
            <td class="px-3.5 py-2.5"><nc-status-badge [status]="n.status"/></td>
            <td class="px-3.5 py-2.5 text-[11.5px] text-nc-ink-3">{{ n.assignedTo?.name || '—' }}</td>
            <td class="px-3.5 py-2.5 text-right">
              @if (isOverdue(n)) { <nc-overdue-badge/> }
              @else { <span class="font-mono text-[11.5px] text-nc-ink-3">{{ n.dueDate ? (n.dueDate | date:'dd/MM') : '—' }}</span> }
            </td>
          </tr>
        } @empty {
          <tr><td colspan="7" class="px-4 py-10 text-center text-nc-ink-3 text-[13px]">Nenhuma NC encontrada com esses filtros.</td></tr>
        }
      </tbody>
    </table>
  </div>
</div>
  `,
})
export class NcsListComponent {
  private svc = inject(NcService);

  q = '';
  statusFilter: StatusNc | null = null;
  severityFilter: SeverityNc | null = null;
  typeFilter: TypeNc | null = null;

  statuses = Object.values(StatusNc);
  severities = Object.values(SeverityNc);
  types = Object.values(TypeNc);

  statusLabel = (s: StatusNc) => STATUS_LABEL[s];
  severityLabel = (s: SeverityNc) => SEVERITY_LABEL[s];
  typeLabel = (t: TypeNc) => TYPE_LABEL[t];

  page = signal<PageDto<NonConformityDto> | null>(null);
  items = computed(() => this.page()?.items ?? []);

  constructor() { this.refresh(); }

  refresh() {
    const filters: NcFilters = {
      q: this.q || undefined,
      status: this.statusFilter ? [this.statusFilter] : undefined,
      severity: this.severityFilter ? [this.severityFilter] : undefined,
      type: this.typeFilter ? [this.typeFilter] : undefined,
      page: 1, pageSize: 50,
    };
    this.svc.list(filters).subscribe(p => this.page.set(p));
  }

  clear() {
    this.q = ''; this.statusFilter = null; this.severityFilter = null; this.typeFilter = null;
    this.refresh();
  }

  isOverdue(n: NonConformityDto): boolean {
    return !!n.dueDate
        && new Date(n.dueDate).getTime() < Date.now()
        && n.status !== StatusNc.ENCERRADA
        && n.status !== StatusNc.CANCELADA;
  }
}
