import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { NcListaPage } from './pages/nc-lista/nc-lista.page';
import { NcNovaPage } from './pages/nc-nova/nc-nova.page';
import { NcDetalhePage } from './pages/nc-detalhe/nc-detalhe.page';
import { MinhaFilaPage } from './pages/minha-fila/minha-fila.page';
import { UsuariosPage } from './pages/usuarios/usuarios.page';
import { AppLayoutComponent } from './shared/components/app-layout/app-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { appHomeGuard } from './core/guards/app-home.guard';
import { roleGuard } from './core/guards/role.guard';
import { Profile } from './core/models/profile.enum';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: 'app',
    canActivate: [authGuard],
    component: AppLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', canActivate: [appHomeGuard], component: DashboardPage },
      { path: 'dashboard', canActivate: [roleGuard([Profile.GESTOR])], component: DashboardPage },
      { path: 'usuarios', canActivate: [roleGuard([Profile.GESTOR])], component: UsuariosPage },
      { path: 'minha-fila', canActivate: [roleGuard([Profile.RESPONSAVEL])], component: MinhaFilaPage },
      { path: 'ncs/nova', component: NcNovaPage },
      { path: 'ncs/:id', component: NcDetalhePage },
      { path: 'ncs', component: NcListaPage },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
