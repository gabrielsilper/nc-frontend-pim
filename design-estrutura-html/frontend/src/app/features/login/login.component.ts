import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'nc-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
<div class="flex w-full h-screen bg-nc-bg text-white font-sans">
  <!-- Left brand column -->
  <div class="flex-[1_1_55%] px-16 py-14 flex flex-col border-r border-white/10">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 bg-nc-accent grid place-items-center rounded-sm font-mono text-[15px] font-extrabold text-nc-bg">NC</div>
      <div>
        <div class="text-base font-semibold">NC Control</div>
        <div class="font-mono text-[10px] text-[#64748B] uppercase tracking-wider">Sistema de Não Conformidades</div>
      </div>
    </div>

    <div class="flex-1 flex flex-col justify-center max-w-[520px]">
      <div class="font-mono text-[11px] text-nc-accent uppercase tracking-[0.1em] mb-5">ISO 9001 · Polo Industrial de Manaus</div>
      <h1 class="text-[44px] font-semibold leading-[1.1] tracking-tight m-0 mb-5">Controle digital de não conformidades na linha de produção.</h1>
      <p class="text-[15px] leading-relaxed text-[#94A3B8] m-0">
        Registre desvios, atribua planos de ação e acompanhe o ciclo de tratamento com rastreabilidade completa.
      </p>
    </div>

    <div class="font-mono text-[10px] text-[#475569] tracking-wider flex justify-between">
      <span>UNID. MANAUS II · LINHAS 1–7</span>
      <span>BUILD 2026.04.24 · v1.0.0</span>
    </div>
  </div>

  <!-- Right form column -->
  <div class="flex-[1_1_45%] bg-nc-panel text-nc-ink px-[72px] py-14 flex flex-col justify-center">
    <form [formGroup]="form" (ngSubmit)="submit()" class="max-w-[380px]">
      <div class="font-mono text-[10px] text-nc-muted uppercase tracking-widest mb-2">Acesso seguro</div>
      <h2 class="text-[28px] font-semibold m-0 mb-2 -tracking-[0.01em]">Entre com sua matrícula</h2>
      <p class="text-[13px] text-nc-ink-3 m-0 mb-8">Use o e-mail corporativo fornecido pelo RH. Em caso de bloqueio, contate a TI (ramal 2200).</p>

      <label class="block mb-4">
        <div class="font-mono text-[11px] font-semibold text-nc-ink-2 uppercase tracking-wider mb-1.5">E-mail corporativo</div>
        <input formControlName="email" type="email" class="w-full px-3 py-2.5 bg-white border border-nc-line-strong rounded-sm text-sm outline-none focus:border-nc-ink" />
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <div class="text-[11px] text-nc-critical mt-1">E-mail inválido</div>
        }
      </label>

      <label class="block mb-3">
        <div class="flex justify-between items-center mb-1.5">
          <span class="font-mono text-[11px] font-semibold text-nc-ink-2 uppercase tracking-wider">Senha</span>
          <a class="text-[11px] text-nc-ink-2 underline cursor-pointer">Esqueci minha senha</a>
        </div>
        <input formControlName="password" type="password" class="w-full px-3 py-2.5 bg-white border border-nc-line-strong rounded-sm text-sm outline-none focus:border-nc-ink" />
      </label>

      @if (error()) {
        <div class="font-mono text-[11px] text-nc-critical mb-5">{{ error() }}</div>
      }

      <button type="submit" [disabled]="form.invalid || loading()" class="w-full py-3 bg-nc-ink text-white text-sm font-semibold rounded-sm flex items-center justify-center gap-2.5 disabled:opacity-60">
        {{ loading() ? 'Autenticando…' : 'Entrar no sistema' }}
      </button>
    </form>
  </div>
</div>
  `,
})
export class LoginComponent {
  private fb = new FormBuilder().nonNullable;
  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
    password: this.fb.control('', [Validators.required, Validators.minLength(6)]),
  });

  constructor(private auth: AuthService) {}

  async submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.auth.login(this.form.getRawValue());
    } catch (e: any) {
      this.error.set('Credenciais inválidas ou serviço indisponível.');
    } finally {
      this.loading.set(false);
    }
  }
}
