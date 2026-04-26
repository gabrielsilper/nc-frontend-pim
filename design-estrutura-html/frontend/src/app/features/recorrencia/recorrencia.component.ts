import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NcService } from '../../core/nc.service';
import { RankingItemDto } from '../../shared/models/dto';
import { TYPE_LABEL, TypeNc } from '../../shared/models/enums';

@Component({
  selector: 'nc-recorrencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="h-14 bg-white border-b border-nc-line px-6 flex items-center gap-6 flex-shrink-0">
  <div class="flex-1">
    <div class="font-mono text-[10px] text-nc-muted uppercase tracking-widest mb-0.5">Análise</div>
    <h1 class="text-[17px] font-semibold m-0">Relatório de Recorrência</h1>
  </div>
  <select [(ngModel)]="period" class="px-2.5 py-1.5 border border-nc-line-strong text-[12.5px] bg-white rounded-sm">
    <option value="month">Mês atual (Abril/2026)</option>
    <option value="quarter">Trimestre</option>
    <option value="year">Ano</option>
  </select>
  <select [(ngModel)]="department" class="px-2.5 py-1.5 border border-nc-line-strong text-[12.5px] bg-white rounded-sm">
    <option value="">Todos os setores</option>
    <option>Estampagem</option><option>Usinagem</option><option>Montagem</option><option>Pintura</option><option>Embalagem</option>
  </select>
</div>

<div class="flex-1 overflow-auto p-6 grid grid-cols-[1fr_320px] gap-4 items-start">
  <section class="bg-white border border-nc-line rounded-sm">
    <div class="px-5 py-3.5 border-b border-nc-line">
      <div class="text-sm font-semibold">Recorrência por tipo de desvio</div>
      <div class="font-mono text-[10px] text-nc-muted uppercase tracking-wider mt-0.5">Variação % comparada ao período anterior</div>
    </div>
    <table class="w-full text-[12.5px] border-collapse">
      <thead class="bg-[#FAFBFC] font-mono text-[10px] text-nc-ink-3 uppercase tracking-wider">
        <tr>
          <th class="text-left px-4 py-2 font-medium">Tipo</th>
          <th class="text-right px-4 py-2 font-medium">Ocorrências</th>
          <th class="text-right px-4 py-2 font-medium">Δ vs. anterior</th>
          <th class="text-left px-4 py-2 font-medium w-[260px]">Proporção</th>
        </tr>
      </thead>
      <tbody>
        @for (r of data(); track r.type) {
          <tr class="border-t border-nc-line">
            <td class="px-4 py-3 font-medium">{{ typeLabel(r.type) }}</td>
            <td class="px-4 py-3 text-right font-mono text-[14px] font-semibold">{{ r.count }}</td>
            <td class="px-4 py-3 text-right font-mono text-[11.5px]"
                [class.text-nc-critical]="r.delta > 0" [class.text-nc-ok]="r.delta < 0">
              {{ r.delta > 0 ? '+' : '' }}{{ r.delta }}%
            </td>
            <td class="px-4 py-3">
              <div class="h-2 bg-[#F1F5F9] relative">
                <div class="absolute left-0 top-0 bottom-0 bg-nc-ink" [style.width.%]="(r.count / maxCount()) * 100"></div>
              </div>
            </td>
          </tr>
        }
      </tbody>
    </table>
  </section>

  <aside class="flex flex-col gap-4">
    <section class="bg-white border border-nc-line rounded-sm p-5">
      <div class="font-mono text-[10px] text-nc-muted uppercase tracking-widest mb-2">Total do período</div>
      <div class="font-mono text-[36px] font-semibold -tracking-[0.03em] leading-none">{{ total() }}</div>
      <div class="font-mono text-[11px] text-nc-ink-3 mt-2">ocorrências registradas</div>
    </section>
    <section class="bg-white border border-nc-line rounded-sm p-5">
      <div class="font-mono text-[10px] text-nc-muted uppercase tracking-widest mb-2">Destaque</div>
      @if (top(); as t) {
        <div class="text-[13px] mb-1"><b>{{ typeLabel(t.type) }}</b> lidera com <b>{{ t.count }}</b> ocorrências.</div>
        <div class="text-[11.5px] text-nc-ink-3">Concentrar ações de melhoria neste eixo deve gerar maior retorno em qualidade.</div>
      }
    </section>
  </aside>
</div>
  `,
})
export class RecorrenciaComponent {
  private svc = inject(NcService);

  period = 'month';
  department = '';

  data = signal<RankingItemDto[]>([]);
  maxCount = computed(() => Math.max(1, ...this.data().map(r => r.count)));
  total = computed(() => this.data().reduce((s, r) => s + r.count, 0));
  top = computed(() => this.data()[0]);

  typeLabel = (t: TypeNc) => TYPE_LABEL[t];

  constructor() {
    this.svc.dashboardRanking(5).subscribe(r => this.data.set(r));
  }
}
