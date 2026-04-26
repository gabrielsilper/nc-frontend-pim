import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { NcListaPage } from './pages/nc-lista/nc-lista.page';
import { NcNovaPage } from './pages/nc-nova/nc-nova.page';
import { AppLayoutComponent } from './shared/components/app-layout/app-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: 'app',
    canActivate: [authGuard],
    component: AppLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardPage },
      { path: 'ncs/nova', component: NcNovaPage },
      { path: 'ncs', component: NcListaPage },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
