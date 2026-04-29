import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Profile, PROFILE_LABEL } from '../../core/models/profile.enum';
import { UserService } from '../../core/services/user.service';

interface ProfileOption {
  value: Profile;
  label: string;
}

@Component({
  selector: 'app-usuarios-nova-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './usuarios-nova.page.html',
})
export class UsuariosNovaPage {
  private fb = inject(FormBuilder).nonNullable;
  private userService = inject(UserService);
  private router = inject(Router);

  loading = signal(false);
  apiErrors = signal<Record<string, string>>({});

  profileOptions: ProfileOption[] = Object.values(Profile)
    .filter((value): value is Profile => typeof value === 'number')
    .map((value) => ({ value, label: PROFILE_LABEL[value] }));

  form = this.fb.group(
    {
      name: this.fb.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s]+$/),
      ]),
      email: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
      profile: this.fb.control<Profile | null>(null, Validators.required),
      password: this.fb.control('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(25),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/),
      ]),
      confirmPassword: this.fb.control('', Validators.required),
    },
    { validators: this.passwordsMatchValidator },
  );

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.apiErrors.set({});

    const { name, email, password, profile } = this.form.getRawValue();

    this.userService
      .create({
        name,
        email,
        password,
        profile: profile!,
      })
      .subscribe({
        next: () => this.router.navigate(['/app/usuarios']),
        error: (e: HttpErrorResponse) => {
          if (e.status === 400 && e.error?.errors) {
            const map: Record<string, string> = {};
            for (const err of e.error.errors as { field: string; message: string }[]) {
              map[err.field] = err.message;
            }
            this.apiErrors.set(map);
          } else if (e.status === 409) {
            this.apiErrors.set({ email: e.error?.message ?? 'Já existe um usuário com este e-mail.' });
          } else {
            this.apiErrors.set({ _global: 'Ocorreu um erro inesperado. Tente novamente.' });
          }
          this.loading.set(false);
        },
      });
  }

  profileLabel(profile: Profile): string {
    return PROFILE_LABEL[profile];
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
