import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Profile, PROFILE_LABEL } from '../../core/models/profile.enum';
import { ResponseUserDTO, UpdateUserDTO } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';

interface ProfileOption {
  value: Profile;
  label: string;
}

@Component({
  selector: 'app-usuario-detalhe-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './usuario-detalhe.page.html',
})
export class UsuarioDetalhePage {
  private fb = inject(FormBuilder).nonNullable;
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  loading = signal(false);
  saving = signal(false);
  error = signal('');
  apiErrors = signal<Record<string, string>>({});
  user = signal<ResponseUserDTO | null>(null);

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
        Validators.minLength(8),
        Validators.maxLength(25),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/),
      ]),
      confirmPassword: this.fb.control(''),
    },
    { validators: this.passwordsMatchValidator },
  );

  constructor() {
    this.load();
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Usuário não encontrado.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.apiErrors.set({});

    this.userService.byId(id).subscribe({
      next: (user) => {
        this.user.set(user);
        this.form.reset({
          name: user.name,
          email: user.email,
          profile: user.profile,
          password: '',
          confirmPassword: '',
        });
        this.loading.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(e.status === 404 ? 'Usuário não encontrado.' : 'Não foi possível carregar os dados do usuário.');
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    const current = this.user();
    if (!current) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);
    this.apiErrors.set({});

    const { name, email, profile, password } = this.form.getRawValue();
    const payload: UpdateUserDTO = {
      name,
      email,
      profile: profile ?? undefined,
    };

    if (password) {
      payload.password = password;
    }

    this.userService.update(current.id, payload).subscribe({
      next: (updated) => {
        this.user.set(updated);
        this.form.reset({
          name: updated.name,
          email: updated.email,
          profile: updated.profile,
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
          this.apiErrors.set({ email: e.error?.message ?? 'Já existe um usuário com este e-mail.' });
        } else if (e.status === 404) {
          this.error.set('Usuário não encontrado.');
        } else {
          this.apiErrors.set({ _global: 'Ocorreu um erro inesperado. Tente novamente.' });
        }
        this.saving.set(false);
      },
    });
  }

  profileLabel(profile: Profile): string {
    return PROFILE_LABEL[profile];
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
