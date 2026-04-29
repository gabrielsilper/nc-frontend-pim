import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Profile, PROFILE_LABEL } from '../../core/models/profile.enum';
import { ResponseUserDTO, UpdateUserDTO } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './perfil.page.html',
})
export class PerfilPage {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder).nonNullable;
  private userService = inject(UserService);

  loading = signal(false);
  saving = signal(false);
  error = signal('');
  apiErrors = signal<Record<string, string>>({});
  user = signal<ResponseUserDTO | null>(null);

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
      password: this.fb.control('', [
        Validators.minLength(8),
        Validators.maxLength(25),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/),
      ]),
      confirmPassword: this.fb.control(''),
    },
    { validators: this.passwordsMatchValidator },
  );

  initials = computed(() => {
    const name = this.form.controls.name.value.trim() || this.user()?.name?.trim();
    if (!name) return '?';
    const parts = name.split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  });

  profileLabel = computed(() => {
    const profile = this.user()?.profile;
    return profile !== undefined ? PROFILE_LABEL[profile] : '';
  });

  accessLabel = computed(() => {
    switch (this.user()?.profile) {
      case Profile.GESTOR:
        return 'Acesso administrativo com visibilidade completa do sistema.';
      case Profile.RESPONSAVEL:
        return 'Acesso operacional para acompanhar a fila e executar tratativas atribuidas.';
      case Profile.OPERADOR:
        return 'Acesso de registro e acompanhamento basico das nao conformidades.';
      default:
        return '';
    }
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.apiErrors.set({});

    this.auth.me().subscribe({
      next: (user) => {
        this.user.set(user);
        this.form.reset({
          name: user.name,
          email: user.email,
          password: '',
          confirmPassword: '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar o perfil. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    const currentUser = this.auth.currentUser();
    if (!currentUser?.id) {
      this.error.set('Nao foi possivel identificar o usuario logado.');
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);
    this.apiErrors.set({});

    const { name, email, password } = this.form.getRawValue();
    const payload: UpdateUserDTO = { name, email };

    if (password) {
      payload.password = password;
    }

    this.userService.update(currentUser.id, payload).subscribe({
      next: (updated) => {
        this.user.set(updated);
        this.auth.syncCurrentUser(updated);
        this.form.reset({
          name: updated.name,
          email: updated.email,
          password: '',
          confirmPassword: '',
        });
        this.saving.set(false);
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 400 && e.error?.errors) {
          const map: Record<string, string> = {};
          for (const err of e.error.errors as { field: string; message: string }[]) {
            map[err.field] = err.message;
          }
          this.apiErrors.set(map);
        } else if (e.status === 409) {
          this.apiErrors.set({ email: e.error?.message ?? 'Ja existe um usuario com este e-mail.' });
        } else {
          this.apiErrors.set({ _global: 'Ocorreu um erro inesperado. Tente novamente.' });
        }
        this.saving.set(false);
      },
    });
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value ?? '';
    const confirmPassword = control.get('confirmPassword')?.value ?? '';

    if (!password) {
      return confirmPassword ? { passwordMismatch: true } : null;
    }

    if (!confirmPassword) {
      return { confirmPasswordRequired: true };
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
