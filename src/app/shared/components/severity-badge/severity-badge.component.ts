import { Component, computed, input } from '@angular/core';
import { SEVERITY_LABEL, SeverityNc } from '../../../core/models/severity-nc.enum';

const SEVERITY_CLASS: Record<SeverityNc, string> = {
  [SeverityNc.CRITICA]: 'bg-nc-critical-soft text-nc-critical',
  [SeverityNc.ALTA]: 'bg-nc-accent-soft text-nc-accent',
  [SeverityNc.MEDIA]: 'bg-nc-medium-soft text-nc-medium',
  [SeverityNc.BAIXA]: 'bg-nc-low-soft text-nc-low',
};

const SEVERITY_DOT: Record<SeverityNc, string> = {
  [SeverityNc.CRITICA]: 'bg-nc-critical',
  [SeverityNc.ALTA]: 'bg-nc-accent',
  [SeverityNc.MEDIA]: 'bg-nc-medium',
  [SeverityNc.BAIXA]: 'bg-nc-low',
};

@Component({
  selector: 'nc-severity-badge',
  standalone: true,
  templateUrl: './severity-badge.component.html',
})
export class SeverityBadgeComponent {
  severity = input.required<SeverityNc>();

  label = computed(() => SEVERITY_LABEL[this.severity()]);
  badgeClass = computed(() => SEVERITY_CLASS[this.severity()]);
  dotClass = computed(() => SEVERITY_DOT[this.severity()]);
}
