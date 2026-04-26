import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'nc-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
<div class="flex h-screen w-full bg-nc-panel">
  <!-- SIDEBAR -->
  <aside class="w-60 flex-shrink-0 bg-nc-bg text-slate-300 flex flex-col">
    <div class="px-5 py-5 border-b border-white/10">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 bg-nc-accent grid place-items-center rounded-sm font-mono text-[13px] font-extrabold text-nc-bg">NC</div>
        <div>
          <div class="text-white text-[13px] font-semibold tracking-tight">NC Control</div>
          <div class="text-[#64748B] text-[10px] font-mono uppercase tracking-wider">v1.0 · Planta PIM</div>
        </div>
      </div>
    </div>

    <div class="px-5 py-3 border-b border-white/10">
      <div class="font-mono text-[9px] text-[#64748B] uppercase tracking-widest mb-1">Planta</div>
      <div class="flex justify-between items-center cursor-pointer">
        <span class="text-white text-xs font-medium">Manaus — Unidade II</span>
      </div>
    </div>

    <nav class="flex-1 p-2">
      @for (item of items; track item.id) {
        <a [routerLink]="item.route" routerLinkActive="is-active"
           class="sidebar-item flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#94A3B8] border-l-2 border-transparent hover:bg-white/5">
          <span class="flex-1">{{ item.label }}</span>
          @if (item.badge) {
            <span class="bg-nc-accent text-nc-bg font-mono text-[10px] font-bold px-1.5 py-[1px] rounded-sm">{{ item.badge }}</span>
          }
        </a>
      }
    </nav>

    <div class="px-5 py-3 border-t border-white/10 font-mono text-[10px] text-[#64748B] tracking-wider">
      <div class="flex justify-between mb-1"><span>SISTEMA</span><span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 bg-nc-ok rounded-full"></span><span class="text-[#94A3B8]">ONLINE</span></span></div>
      <div class="flex justify-between"><span>SINCR.</span><span class="text-[#94A3B8]">14:42:08</span></div>
    </div>

    <div class="px-4 py-3 border-t border-white/10 flex items-center gap-2.5">
      <div class="w-[30px] h-[30px] bg-slate-700 text-white grid place-items-center font-mono text-[11px] font-semibold rounded-sm">{{ initials() }}</div>
      <div class="flex-1 min-w-0">
        <div class="text-white text-xs font-medium truncate">{{ user()?.name }}</div>
        <div class="text-[#64748B] text-[10px] font-mono uppercase tracking-wider">{{ user()?.profile }}</div>
      </div>
      <button (click)="auth.logout()" class="text-[#64748B] hover:text-white text-[10px] font-mono">sair</button>
    </div>
  </aside>

  <main class="flex-1 flex flex-col min-w-0 bg-nc-panel">
    <router-outlet />
  </main>
</div>

<style>
  :host ::ng-deep .sidebar-item.is-active {
    color: white !important;
    background: rgba(217, 119, 6, 0.12);
    border-left-color: #D97706 !important;
    font-weight: 500;
  }
</style>
  `,
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly user = this.auth.user;
  readonly initials = computed(() => {
    const n = this.user()?.name ?? '';
    return n.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() || '??';
  });

  readonly items = [
    { id: 'dashboard', label: 'Dashboard',                route: '/app/dashboard' },
    { id: 'ncs',       label: 'Não Conformidades',        route: '/app/ncs' },
    { id: 'fila',      label: 'Minha Fila',               route: '/app/minha-fila', badge: '7' },
    { id: 'acoes',     label: 'Plano de Ação',            route: '/app/acoes' },
    { id: 'recorr',    label: 'Relatório de Recorrência', route: '/app/relatorios/recorrencia' },
  ];
}
