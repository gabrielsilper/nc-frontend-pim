import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { Profile } from '../../core/models/profile.enum';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private fb = inject(FormBuilder).nonNullable;
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
    password: this.fb.control('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(25),
    ]),
  });

  submit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate([this.routeForProfile()]),
      error: (e: HttpErrorResponse) => {
        this.error.set(this.resolveErrorMessage(e));
        this.loading.set(false);
      },
    });
  }

  private routeForProfile(): string {
    switch (this.auth.currentUser()?.profile) {
      case Profile.GESTOR:
        return '/app/dashboard';
      case Profile.RESPONSAVEL:
        return '/app/minha-fila';
      default:
        return '/app/ncs';
    }
  }

  private resolveErrorMessage(e: HttpErrorResponse): string {
    if (e.status === 401) {
      return 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.';
    }
    if (e.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão ou tente mais tarde.';
    }
    return 'Ocorreu um erro inesperado. Tente novamente ou contate a TI (ramal 2200).';
  }
}
