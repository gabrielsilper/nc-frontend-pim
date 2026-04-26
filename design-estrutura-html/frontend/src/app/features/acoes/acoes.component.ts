import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NcService } from '../../core/nc.service';
import { CorrectiveActionDto, NonConformityDto } from '../../shared/models/dto';
import { StatusCa } from '../../shared/models/enums';

interface Row { nc: NonConformityDto; action: CorrectiveActionDto; }

@Component({
  selector: 'nc-acoes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="h-14 bg-white border-b border-nc-line px-6 flex items-center gap-6 flex-shrink-0">
  <div class="flex-1">
    <div class="font-mono text-[10px] text-nc-muted uppercase tracking-widest mb-0.5">Execução</div>
    <h1 class="text-[17px] font-semibold m-0">Plano de Ação — visão Kanban</h1>
  </div>
  <div class="font-mono text-[11px] text-nc-ink-3">{{ rows().length }} ações · {{ pendingCount() }} pendentes</div>
</div>

<div class="flex-1 overflow-auto p-6">
  <div class="grid grid-cols-3 gap-3">
    @for (col of columns; track col.status) {
      <div class="bg-[#F1F3F5] border border-nc-line rounded-sm">
        <div class="px-3.5 py-2.5 border-b border-nc-line flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" [class]="col.dot"></span>
            <span class="text-[12.5px] font-semibold">{{ col.label }}</span>
          </div>
          <span class="font-mono text-[10px] text-nc-ink-3">{{ count(col.status) }}</span>
        </div>
        <div class="p-2.5 flex flex-col gap-2 min-h-[240px]">
          @for (r of grouped(col.status); track r.action.id) {
            <a [routerLink]="['/app/ncs', r.nc.id]" class="block p-3 bg-white border border-nc-line rounded-sm">
              <div class="font-mono text-[10px] text-nc-ink-3 mb-1">{{ r.nc.number }}</div>
              <div class="text-[12.5px] font-medium mb-2 line-clamp-2">{{ r.action.description }}</div>
              <div class="flex justify-between items-center font-mono text-[10px] text-nc-ink-3 uppercase tracking-wider">
                <span>{{ r.action.assignee.name }}</span>
                <span>{{ r.action.deadline | date:'dd/MM' }}</span>
              </div>
            </a>
          } @empty {
            <div class="p-4 text-center text-[11.5px] text-nc-ink-3">Vazio</div>
          }
        </div>
      </div>
    }
  </div>
</div>
  `,
})
export class AcoesComponent {
  private svc = inject(NcService);
  rows = signal<Row[]>([]);

  columns: { status: StatusCa; label: string; dot: string }[] = [
    { status: StatusCa.PENDENTE,     label: 'Pendente',     dot: 'bg-nc-ink-3' },
    { status: StatusCa.EM_ANDAMENTO, label: 'Em andamento', dot: 'bg-nc-accent' },
    { status: StatusCa.CONCLUIDA,    label: 'Concluída',    dot: 'bg-nc-ok' },
  ];

  pendingCount = computed(() => this.rows().filter(r => r.action.status !== StatusCa.CONCLUIDA).length);

  constructor() {
    // Puxa NCs abertas e agrega ações. Estratégia simples p/ MVP; em prod, criar endpoint dedicado.
    this.svc.list({ pageSize: 100 }).subscribe(page => {
      const all: Row[] = [];
      let done = 0;
      if (!page.items.length) this.rows.set([]);
      page.items.forEach(nc => {
        this.svc.correctiveActions(nc.id).subscribe(actions => {
          actions.forEach(a => all.push({ nc, action: a }));
          done++;
          if (done === page.items.length) this.rows.set(all);
        });
      });
    });
  }

  grouped = (s: StatusCa) => this.rows().filter(r => r.action.status === s);
  count = (s: StatusCa) => this.grouped(s).length;
}
