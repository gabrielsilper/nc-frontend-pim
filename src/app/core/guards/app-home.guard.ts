import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Profile } from '../models/profile.enum';
import { AuthService } from '../services/auth.service';

export const appHomeGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const profile = auth.currentUser()?.profile;

  if (profile === Profile.GESTOR) {
    return true;
  }

  if (profile === Profile.RESPONSAVEL) {
    return router.createUrlTree(['/app/minha-fila']);
  }

  return router.createUrlTree(['/app/ncs']);
};
