import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Profile } from '../models/profile.enum';

export const roleGuard = (allowed: Profile[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const profile = auth.currentUser()?.profile;
  if (profile !== undefined && allowed.includes(profile)) {
    return true;
  }

  return router.createUrlTree(['/app/ncs']);
};
