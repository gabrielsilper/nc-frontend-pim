import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NcService } from '../../core/nc.service';
import { SeverityNc, TypeNc, SEVERITY_LABEL, TYPE_LABEL } from '../../shared/models/enums';

@Component({
  selector: 'nc-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="h-14 bg-white border-b border-nc-line px-6 flex items-center gap-4 flex-shrink-0">
  <a routerLink="/app/ncs" class="font-mono text-[11px] text-nc-ink-3 underline">← NCs</a>
  <div class="flex-1">
    <div class="font-mono text-[10px] text-nc-muted uppercase tracking-widest">Registro</div>
    <h1 class="text-[17px] font-semibold m-0">Nova Não Conformidade</h1>
  </div>
  <div class="font-mono text-[11px] text-nc-ink-3">Número será gerado no servidor</div>
</div>

<div class="flex-1 overflow-auto p-6">
  <form [formGroup]="form" (ngSubmit)="submit()" class="max-w-[820px] bg-white border border-nc-line rounded-sm p-6">
    <div class="grid grid-cols-2 gap-4">
      <label class="block col-span-2">
        <div class="font-mono text-[11px] font-semibold text-nc-ink-2 uppercase tracking-wider mb-1.5">Título <span class="text-nc-critical">*</span></div>
        <input formControlName="title" class="w-full px-3 py-2 border border-nc-line-strong text-sm rounded-sm outline-none focus:border-nc-ink"
               placeholder="Resumo curto (ex: Peça fora de tolerância — estampo #3)"/>
      </label>

      <label class="block col-span-2">
        <div class="font-mono text-[11px] font-semibold text-nc-ink-2 uppercase tracking-wider mb-1.5">Descrição <span class="text-nc-critical">*</span></div>
        <textarea formControlName="description" rows="5"
                  class="w-full px-3 py-2 border border-nc-line-strong text-sm rounded-sm outline-none focus:border-nc-ink"
                  placeholder="Descreva o desvio observado, quando foi detectado, condições da linha…"></textarea>
      </label>

      <label class="block">
        <div class="font-mono text-[11px] font-semibold text-nc-ink-2 uppercase tracking-wider mb-1.5">Tipo <span class="text-nc-critical">*</span></div>
        <select formControlName="type" class="w-full px-2.5 py-2 border border-nc-line-strong text-[13px] bg-white rounded-sm">
          <option [ngValue]="null" disabled>Selecione…</option>
          @for (t of types; track t) { <option [ngValue]="t">{{ typeLabel(t) }}</option> }
        </select>
      </label>

      <label class="block">
        <div class="font-mono text-[11px] font-semibold text-nc-ink-2 uppercase tracking-wider mb-1.5">Gravidade <span class="text-nc-critical">*</span></div>
        <select formControlName="severity" class="w-full px-2.5 py-2 border border-nc-line-strong text-[13px] bg-white rounded-sm">
          <option [ngValue]="null" disabled>Selecione…</option>
          @for (s of severities; track s) { <option [ngValue]="s">{{ severityLabel(s) }}</option> }
        </select>
      </label>

      <label class="block">
        <div class="font-mono text-[11px] font-semibold text-nc-ink-2 uppercase tracking-wider mb-1.5">Linha / Processo <span class="text-nc-critical">*</span></div>
        <input formControlName="processLine" class="w-full px-3 py-2 border border-nc-line-strong text-sm rounded-sm outline-none focus:border-nc-ink"
               placeholder="Ex: Linha 3 — Estampagem"/>
      </label>

      <label class="block">
        <div class="font-mono text-[11px] font-semibold text-nc-ink-2 uppercase tracking-wider mb-1.5">Setor <span class="text-nc-critical">*</span></div>
        <input formControlName="department" class="w-full px-3 py-2 border border-nc-line-strong text-sm rounded-sm outline-none focus:border-nc-ink"
               placeholder="Ex: Usinagem"/>
      </label>
    </div>

    @if (error()) { <div class="mt-4 font-mono text-[11px] text-nc-critical">{{ error() }}</div> }

    <div class="mt-6 flex justify-end gap-2">
      <a routerLink="/app/ncs" class="px-4 py-2 border border-nc-line-strong text-[13px] rounded-sm">Cancelar</a>
      <button type="submit" [disabled]="form.invalid || loading()"
              class="px-4 py-2 bg-nc-ink text-white text-[13px] font-medium rounded-sm disabled:opacity-60">
        {{ loading() ? 'Registrando…' : 'Registrar NC' }}
      </button>
    </div>
  </form>
</div>
  `,
})
export class NcNewComponent {
  private fb = new FormBuilder().nonNullable;
  private svc = inject(NcService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  types = Object.values(TypeNc);
  severities = Object.values(SeverityNc);
  typeLabel = (t: TypeNc) => TYPE_LABEL[t];
  severityLabel = (s: SeverityNc) => SEVERITY_LABEL[s];

  form = this.fb.group({
    title: this.fb.control('', [Validators.required, Validators.minLength(5)]),
    description: this.fb.control('', [Validators.required, Validators.minLength(10)]),
    type: this.fb.control<TypeNc | null>(null, Validators.required),
    severity: this.fb.control<SeverityNc | null>(null, Validators.required),
    processLine: this.fb.control('', Validators.required),
    department: this.fb.control('', Validators.required),
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    this.svc.create(v as any).subscribe({
      next: (nc) => this.router.navigate(['/app/ncs', nc.id]),
      error: () => { this.error.set('Falha ao registrar NC. Verifique os dados.'); this.loading.set(false); },
    });
  }
}
