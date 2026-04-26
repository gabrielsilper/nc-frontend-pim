import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NcService } from '../../core/nc.service';
import { CorrectiveActionDto, NonConformityDto } from '../../shared/models/dto';
import { allowedStatusTransitions, StatusNc, STATUS_LABEL, TYPE_LABEL, SEVERITY_LABEL } from '../../shared/models/enums';
import { SeverityBadgeComponent, StatusBadgeComponent, OverdueBadgeComponent } from '../../shared/ui/badges';

@Component({
  selector: 'nc-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SeverityBadgeComponent, StatusBadgeComponent, OverdueBadgeComponent],
  template: `
@if (nc(); as n) {
<div class="h-14 bg-white border-b border-nc-line px-6 flex items-center gap-4 flex-shrink-0">
  <a routerLink="/app/ncs" class="font-mono text-[11px] text-nc-ink-3 underline">← NCs</a>
  <div class="flex-1">
    <div class="font-mono text-[11px] text-nc-muted tracking-wider">{{ n.number }}</div>
    <h1 class="text-[17px] font-semibold m-0 truncate">{{ n.title }}</h1>
  </div>
  <nc-severity-badge [severity]="n.severity"/>
  <nc-status-badge [status]="n.status"/>
  @if (isOverdue(n)) { <nc-overdue-badge/> }
</div>

<div class="flex-1 overflow-auto p-6 grid grid-cols-[1fr_340px] gap-4 items-start">
  <!-- Coluna principal -->
  <div class="flex flex-col gap-4">
    <!-- Descrição -->
    <section class="bg-white border border-nc-line rounded-sm p-5">
      <div class="font-mono text-[10px] text-nc-muted uppercase tracking-widest mb-1">Descrição do desvio</div>
      <p class="text-[13px] leading-relaxed text-nc-ink whitespace-pre-wrap m-0">{{ n.description }}</p>

      <div class="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-nc-line">
        <div><div class="font-mono text-[9.5px] text-nc-muted uppercase tracking-wider mb-0.5">Tipo</div><div class="text-[12.5px] font-medium">{{ typeLabel(n.type) }}</div></div>
        <div><div class="font-mono text-[9.5px] text-nc-muted uppercase tracking-wider mb-0.5">Gravidade</div><div class="text-[12.5px] font-medium">{{ severityLabel(n.severity) }}</div></div>
        <div><div class="font-mono text-[9.5px] text-nc-muted uppercase tracking-wider mb-0.5">Linha</div><div class="text-[12.5px] font-medium font-mono">{{ n.processLine }}</div></div>
        <div><div class="font-mono text-[9.5px] text-nc-muted uppercase tracking-wider mb-0.5">Setor</div><div class="text-[12.5px] font-medium">{{ n.department }}</div></div>
      </div>
    </section>

    <!-- Plano de ação -->
    <section class="bg-white border border-nc-line rounded-sm">
      <div class="px-5 py-3.5 border-b border-nc-line flex justify-between items-center">
        <div>
          <div class="text-sm font-semibold">Plano de ação</div>
          <div class="font-mono text-[10px] text-nc-muted uppercase tracking-wider mt-0.5">{{ actions().length }} ações · {{ doneCount() }} concluídas</div>
        </div>
        <button (click)="toggleActionForm()" class="text-[11.5px] text-nc-ink-2 underline">+ Adicionar ação</button>
      </div>

      @if (showActionForm()) {
        <div class="px-5 py-4 border-b border-nc-line bg-[#FAFBFC] grid grid-cols-[1fr_200px_140px_auto] gap-2 items-end">
          <input [(ngModel)]="newDesc" placeholder="O que deve ser feito" class="px-2.5 py-1.5 border border-nc-line-strong text-[12.5px] rounded-sm"/>
          <input [(ngModel)]="newAssignee" placeholder="Responsável" class="px-2.5 py-1.5 border border-nc-line-strong text-[12.5px] rounded-sm"/>
          <input [(ngModel)]="newDeadline" type="date" class="px-2.5 py-1.5 border border-nc-line-strong text-[12.5px] rounded-sm"/>
          <button class="px-3 py-1.5 bg-nc-ink text-white text-[12px] font-medium rounded-sm">Salvar</button>
        </div>
      }

      @for (a of actions(); track a.id) {
        <div class="px-5 py-3.5 border-b border-nc-line last:border-b-0 flex gap-4 items-start">
          <div class="mt-[3px] w-4 h-4 border-2 border-nc-line-strong rounded-sm flex-shrink-0"
               [class.bg-nc-ok]="a.status === 'CONCLUIDA'"
               [class.border-nc-ok]="a.status === 'CONCLUIDA'"></div>
          <div class="flex-1 min-w-0">
            <div class="text-[13px] text-nc-ink mb-1">{{ a.description }}</div>
            <div class="flex gap-4 font-mono text-[10.5px] text-nc-ink-3 uppercase tracking-wider">
              <span>Resp: {{ a.assignee.name }}</span>
              <span>Prazo: {{ a.deadline | date:'dd/MM/yyyy' }}</span>
              <span>Status: {{ a.status }}</span>
            </div>
            @if (a.evidence) {
              <div class="mt-1.5 text-[11.5px] text-nc-ink-3 italic">Evidência: {{ a.evidence }}</div>
            }
          </div>
        </div>
      } @empty {
        <div class="px-5 py-8 text-center text-[12.5px] text-nc-ink-3">Nenhuma ação cadastrada ainda.</div>
      }
    </section>

    <!-- Causa raiz -->
    <section class="bg-white border border-nc-line rounded-sm p-5">
      <div class="font-mono text-[10px] text-nc-muted uppercase tracking-widest mb-2">Causa raiz</div>
      <textarea rows="3" [(ngModel)]="rootCause" placeholder="Descreva a causa raiz identificada (obrigatório para encerrar)…"
                class="w-full px-3 py-2 border border-nc-line-strong text-[13px] rounded-sm outline-none focus:border-nc-ink resize-none"></textarea>
    </section>
  </div>

  <!-- Sidebar -->
  <aside class="flex flex-col gap-4 sticky top-0">
    <section class="bg-white border border-nc-line rounded-sm">
      <div class="px-4 py-3 border-b border-nc-line"><div class="text-[13px] font-semibold">Situação</div></div>
      <div class="p-4 grid gap-3">
        <div>
          <div class="font-mono text-[9.5px] text-nc-muted uppercase tracking-wider mb-1">Aberta por</div>
          <div class="text-[12.5px]">{{ n.createdBy.name }}</div>
          <div class="font-mono text-[10.5px] text-nc-ink-3">{{ n.openedAt | date:'dd/MM/yyyy HH:mm' }}</div>
        </div>
        <div>
          <div class="font-mono text-[9.5px] text-nc-muted uppercase tracking-wider mb-1">Responsável</div>
          @if (n.assignedTo) {
            <div class="text-[12.5px]">{{ n.assignedTo.name }}</div>
          } @else {
            <button class="text-[11.5px] text-nc-accent underline">Atribuir responsável</button>
          }
        </div>
        <div>
          <div class="font-mono text-[9.5px] text-nc-muted uppercase tracking-wider mb-1">Prazo</div>
          <input type="date" [(ngModel)]="dueDateLocal" (change)="saveDueDate()" class="px-2 py-1 border border-nc-line-strong text-[12.5px] rounded-sm"/>
        </div>
      </div>
    </section>

    <section class="bg-white border border-nc-line rounded-sm">
      <div class="px-4 py-3 border-b border-nc-line"><div class="text-[13px] font-semibold">Transição de status</div></div>
      <div class="p-4 grid gap-2">
        @for (next of allowed(); track next) {
          <button (click)="transition(next)" class="w-full px-3 py-2 text-left text-[12.5px] border border-nc-line-strong rounded-sm hover:bg-[#FAFBFC] flex justify-between items-center">
            <span>→ {{ statusLabel(next) }}</span>
            <span class="font-mono text-[10px] text-nc-ink-3">{{ next }}</span>
          </button>
        } @empty {
          <div class="text-[11.5px] text-nc-ink-3">Nenhuma transição disponível a partir de <b>{{ statusLabel(n.status) }}</b>.</div>
        }
      </div>
    </section>
  </aside>
</div>
}
  `,
})
export class NcDetailComponent {
  private svc = inject(NcService);
  private route = inject(ActivatedRoute);

  nc = signal<NonConformityDto | null>(null);
  actions = signal<CorrectiveActionDto[]>([]);
  showActionForm = signal(false);
  rootCause = '';
  dueDateLocal = '';

  newDesc = '';
  newAssignee = '';
  newDeadline = '';

  doneCount = computed(() => this.actions().filter(a => a.status === 'CONCLUIDA').length);
  allowed = computed(() => {
    const s = this.nc()?.status;
    return s ? allowedStatusTransitions(s) : [];
  });

  statusLabel = (s: StatusNc) => STATUS_LABEL[s];
  typeLabel = (t: any) => (TYPE_LABEL as any)[t] ?? t;
  severityLabel = (s: any) => (SEVERITY_LABEL as any)[s] ?? s;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.svc.byId(id).subscribe(n => {
        this.nc.set(n);
        this.rootCause = n.rootCause ?? '';
        this.dueDateLocal = n.dueDate ? n.dueDate.slice(0, 10) : '';
      });
      this.svc.correctiveActions(id).subscribe(a => this.actions.set(a));
    }
  }

  toggleActionForm() { this.showActionForm.update(v => !v); }

  saveDueDate() {
    const n = this.nc(); if (!n || !this.dueDateLocal) return;
    this.svc.updateDueDate(n.id, new Date(this.dueDateLocal).toISOString()).subscribe(updated => this.nc.set(updated));
  }

  transition(next: StatusNc) {
    const n = this.nc(); if (!n) return;
    this.svc.updateStatus(n.id, next).subscribe(updated => this.nc.set(updated));
  }

  isOverdue(n: NonConformityDto): boolean {
    return !!n.dueDate
        && new Date(n.dueDate).getTime() < Date.now()
        && n.status !== StatusNc.ENCERRADA
        && n.status !== StatusNc.CANCELADA;
  }
}
