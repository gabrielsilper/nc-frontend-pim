import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { SeverityNc, SEVERITY_LABEL, StatusNc, STATUS_LABEL, StatusCa } from '../models/enums';

@Component({
  selector: 'nc-severity-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1.5 px-2 py-[3px] font-mono text-[10.5px] font-semibold uppercase tracking-wider rounded-sm"
          [class]="cls()">
      <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
      {{ label() }}
    </span>
  `,
})
export class SeverityBadgeComponent {
  severity = input.required<SeverityNc>();
  label = computed(() => SEVERITY_LABEL[this.severity()].toUpperCase());
  cls = computed(() => ({
    [SeverityNc.CRITICA]: 'bg-nc-critical-soft text-nc-critical',
    [SeverityNc.ALTA]:    'bg-nc-accent-soft text-nc-accent',
    [SeverityNc.MEDIA]:   'bg-nc-medium-soft text-nc-medium',
    [SeverityNc.BAIXA]:   'bg-nc-low-soft text-nc-low',
  }[this.severity()]));
}

@Component({
  selector: 'nc-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-block px-2 py-[3px] font-mono text-[10.5px] font-semibold uppercase tracking-wider rounded-sm"
          [class]="cls()">
      {{ label() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  status = input.required<StatusNc>();
  label = computed(() => STATUS_LABEL[this.status()].toUpperCase());
  cls = computed(() => ({
    [StatusNc.ABERTA]:                 'bg-[#E0F2FE] text-[#075985]',
    [StatusNc.EM_TRATAMENTO]:          'bg-nc-accent-soft text-[#9A3412]',
    [StatusNc.AGUARDANDO_VERIFICACAO]: 'bg-[#EDE9FE] text-[#5B21B6]',
    [StatusNc.ENCERRADA]:              'bg-nc-ok-soft text-[#166534]',
    [StatusNc.CANCELADA]:              'bg-[#F1F5F9] text-[#475569]',
  }[this.status()]));
}

@Component({
  selector: 'nc-overdue-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center gap-1 px-2 py-[3px] bg-nc-critical text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-sm">
      Prazo vencido
    </span>
  `,
})
export class OverdueBadgeComponent {}
