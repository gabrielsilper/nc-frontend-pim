import { Component, computed, input } from '@angular/core';
import { STATUS_LABEL, StatusNc } from '../../../core/models/status-nc.enum';

const STATUS_CLASS: Record<StatusNc, string> = {
  [StatusNc.ABERTA]: 'bg-nc-low-soft text-nc-ink-2',
  [StatusNc.EM_TRATAMENTO]: 'bg-nc-accent-soft text-nc-accent',
  [StatusNc.AGUARDANDO_VERIFICACAO]: 'bg-nc-medium-soft text-nc-medium',
  [StatusNc.ENCERRADA]: 'bg-nc-ok-soft text-nc-ok',
  [StatusNc.CANCELADA]: 'bg-nc-critical-soft text-nc-critical',
};

@Component({
  selector: 'nc-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  status = input.required<StatusNc>();

  label = computed(() => STATUS_LABEL[this.status()]);
  badgeClass = computed(() => STATUS_CLASS[this.status()]);
}
