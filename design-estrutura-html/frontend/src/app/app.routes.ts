import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/login' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard',       loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'ncs',             loadComponent: () => import('./features/ncs/ncs-list.component').then(m => m.NcsListComponent) },
      { path: 'ncs/nova',        loadComponent: () => import('./features/ncs/nc-new.component').then(m => m.NcNewComponent), canDeactivate: [() => confirm('Sair? Dados não salvos serão perdidos.')] },
      { path: 'ncs/:id',         loadComponent: () => import('./features/ncs/nc-detail.component').then(m => m.NcDetailComponent) },
      { path: 'minha-fila',      loadComponent: () => import('./features/fila/fila.component').then(m => m.FilaComponent) },
      { path: 'acoes',           loadComponent: () => import('./features/acoes/acoes.component').then(m => m.AcoesComponent) },
      { path: 'relatorios/recorrencia', loadComponent: () => import('./features/recorrencia/recorrencia.component').then(m => m.RecorrenciaComponent) },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
