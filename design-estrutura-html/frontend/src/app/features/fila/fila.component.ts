import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NcService } from '../../core/nc.service';
import { NonConformityDto } from '../../shared/models/dto';
import { StatusNc } from '../../shared/models/enums';
import { SeverityBadgeComponent, StatusBadgeComponent, OverdueBadgeComponent } from '../../shared/ui/badges';

@Component({
  selector: 'nc-fila',
  standalone: true,
  imports: [CommonModule, RouterLink, SeverityBadgeComponent, StatusBadgeComponent, OverdueBadgeComponent],
  template: `
<div class="h-14 bg-white border-b border-nc-line px-6 flex items-center gap-6 flex-shrink-0">
  <div class="flex-1">
    <div class="font-mono text-[10px] text-nc-muted uppercase tracking-widest mb-0.5">Pessoal</div>
    <h1 class="text-[17px] font-semibold m-0">Minha Fila</h1>
  </div>
  <div class="font-mono text-[11px] text-nc-ink-3">{{ auth.user()?.name }} · {{ items().length }} NCs atribuídas</div>
</div>

<div class="flex-1 overflow-auto p-6">
  @if (overdue().length) {
    <div class="mb-5">
      <div class="font-mono text-[11px] font-semibold text-nc-critical uppercase tracking-widest mb-2.5 flex items-center gap-2">
        <span class="w-2 h-2 bg-nc-critical rounded-full"></span>
        PRAZO VENCIDO — ação imediata
      </div>
      <div class="grid gap-2.5">
        @for (n of overdue(); track n.id) {
          <a [routerLink]="['/app/ncs', n.id]" class="block p-3.5 bg-white border-l-[3px] border-nc-critical border border-nc-line rounded-sm hover:bg-[#FFFAF9]">
            <div class="flex items-baseline gap-3 mb-1">
              <span class="font-mono text-[11px] text-nc-ink-3">{{ n.number }}</span>
              <span class="text-[13px] font-medium flex-1 truncate">{{ n.title }}</span>
              <nc-overdue-badge/>
            </div>
            <div class="flex gap-3 items-center">
              <nc-severity-badge [severity]="n.severity"/>
              <nc-status-badge [status]="n.status"/>
              <span class="font-mono text-[10.5px] text-nc-ink-3">{{ n.processLine }} · prazo {{ n.dueDate | date:'dd/MM' }}</span>
            </div>
          </a>
        }
      </div>
    </div>
  }

  <div>
    <div class="font-mono text-[11px] font-semibold text-nc-ink-2 uppercase tracking-widest mb-2.5">Próximos prazos</div>
    <div class="grid gap-2.5">
      @for (n of upcoming(); track n.id) {
        <a [routerLink]="['/app/ncs', n.id]" class="block p-3.5 bg-white border border-nc-line rounded-sm hover:bg-[#FAFBFC]">
          <div class="flex items-baseline gap-3 mb-1">
            <span class="font-mono text-[11px] text-nc-ink-3">{{ n.number }}</span>
            <span class="text-[13px] font-medium flex-1 truncate">{{ n.title }}</span>
            <span class="font-mono text-[11px] text-nc-ink-3">prazo {{ n.dueDate ? (n.dueDate | date:'dd/MM') : '—' }}</span>
          </div>
          <div class="flex gap-3 items-center">
            <nc-severity-badge [severity]="n.severity"/>
            <nc-status-badge [status]="n.status"/>
            <span class="font-mono text-[10.5px] text-nc-ink-3">{{ n.processLine }} · {{ n.department }}</span>
          </div>
        </a>
      } @empty {
        <div class="p-8 bg-white border border-nc-line text-center text-[13px] text-nc-ink-3">
          Nenhuma NC na sua fila. 🎉 (placeholder)
        </div>
      }
    </div>
  </div>
</div>
  `,
})
export class FilaComponent {
  readonly auth = inject(AuthService);
  private svc = inject(NcService);

  items = signal<NonConformityDto[]>([]);

  overdue = computed(() =>
    this.items()
      .filter(n => this.isOverdue(n))
      .sort((a, b) => +new Date(a.dueDate!) - +new Date(b.dueDate!)),
  );

  upcoming = computed(() =>
    this.items()
      .filter(n => !this.isOverdue(n))
      .sort((a, b) => +new Date(a.dueDate ?? '2999-01-01') - +new Date(b.dueDate ?? '2999-01-01')),
  );

  constructor() {
    this.svc.list({ assignedToMe: true, pageSize: 100 }).subscribe(p => this.items.set(p.items));
  }

  private isOverdue(n: NonConformityDto): boolean {
    return !!n.dueDate
        && new Date(n.dueDate).getTime() < Date.now()
        && n.status !== StatusNc.ENCERRADA
        && n.status !== StatusNc.CANCELADA;
  }
}
