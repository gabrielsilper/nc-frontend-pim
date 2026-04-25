import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: 'app',
    canActivate: [authGuard],
    children: [],
  },
  { path: '**', redirectTo: 'login' },
];
