import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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
  success = signal(false);
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
    this.success.set(false);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/app/dashboard']), 800);
      },
      error: () => {
        this.error.set('Credenciais inválidas ou serviço indisponível.');
        this.loading.set(false);
      },
    });
  }
}
