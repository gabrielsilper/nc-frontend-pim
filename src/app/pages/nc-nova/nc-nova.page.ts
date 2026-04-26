import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SeverityNc } from '../../core/models/severity-nc.enum';
import { TypeNc } from '../../core/models/type-nc.enum';
import { NonConformityService } from '../../core/services/non-conformity.service';

@Component({
  selector: 'app-nc-nova-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './nc-nova.page.html',
})
export class NcNovaPage {
  private fb = inject(FormBuilder).nonNullable;
  private svc = inject(NonConformityService);
  private router = inject(Router);

  loading = signal(false);
  apiErrors = signal<Record<string, string>>({});

  form = this.fb.group({
    title: this.fb.control('', [Validators.required, Validators.maxLength(120)]),
    description: this.fb.control(''),
    severity: this.fb.control<SeverityNc | null>(null, Validators.required),
    type: this.fb.control<TypeNc | null>(null, Validators.required),
    processLine: this.fb.control('', Validators.required),
    department: this.fb.control('', Validators.required),
  });

  titleLength = computed(() => this.form.controls.title.value.length);

  severities: { value: SeverityNc; label: string; dotCls: string }[] = [
    { value: SeverityNc.BAIXA, label: 'Baixa', dotCls: 'bg-nc-low' },
    { value: SeverityNc.MEDIA, label: 'Média', dotCls: 'bg-nc-medium' },
    { value: SeverityNc.ALTA, label: 'Alta', dotCls: 'bg-nc-accent' },
    { value: SeverityNc.CRITICA, label: 'Crítica', dotCls: 'bg-nc-critical' },
  ];

  types: { value: TypeNc; label: string }[] = [
    { value: TypeNc.PRODUTO, label: 'Produto' },
    { value: TypeNc.PROCESSO, label: 'Processo' },
    { value: TypeNc.MATERIAL, label: 'Material' },
    { value: TypeNc.SEGURANCA, label: 'Segurança' },
    { value: TypeNc.OUTRO, label: 'Outro' },
  ];

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.apiErrors.set({});

    const { title, description, severity, type, processLine, department } = this.form.getRawValue();

    this.svc
      .create({
        title,
        description,
        severity: severity!,
        type: type!,
        processLine,
        department,
      })
      .subscribe({
        next: () => this.router.navigate(['/app/ncs']),
        error: (e: HttpErrorResponse) => {
          if (e.status === 400 && e.error?.errors) {
            const map: Record<string, string> = {};
            for (const err of e.error.errors as { field: string; message: string }[]) {
              map[err.field] = err.message;
            }
            this.apiErrors.set(map);
          } else {
            this.apiErrors.set({ _global: 'Ocorreu um erro inesperado. Tente novamente.' });
          }
          this.loading.set(false);
        },
      });
  }
}
