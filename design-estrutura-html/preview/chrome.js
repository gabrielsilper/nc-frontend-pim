// NC Control — sidebar + topbar helpers (shared across pages)

window.renderSidebar = function(activeId) {
  const items = [
    { id: 'dashboard', label: 'Dashboard',                icon: 'grid',  href: 'dashboard.html' },
    { id: 'ncs',       label: 'Não Conformidades',        icon: 'list',  href: 'ncs-list.html' },
    { id: 'fila',      label: 'Minha Fila',               icon: 'inbox', href: 'minha-fila.html', badge: '7' },
    { id: 'acoes',     label: 'Plano de Ação',            icon: 'check', href: 'plano-acao.html' },
    { id: 'recorr',    label: 'Relatório de Recorrência', icon: 'chart', href: 'recorrencia.html' },
  ];
  return `
    <aside class="sidebar">
      <div class="sidebar__block" style="padding: 20px 20px 16px;">
        <div class="sidebar__brand">
          <div class="sidebar__logo">NC</div>
          <div>
            <div style="color:#fff;font-size:13px;font-weight:600;letter-spacing:0.2px">NC Control</div>
            <div style="color:#64748B;font-size:10px;font-family:'JetBrains Mono',monospace;letter-spacing:0.5px;text-transform:uppercase">v1.0 · Planta PIM</div>
          </div>
        </div>
      </div>

      <div class="sidebar__block">
        <div class="sidebar__eyebrow">Planta</div>
        <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer">
          <div style="color:#fff;font-size:12px;font-weight:500">Manaus — Unidade II</div>
          ${NCUI.icon('chevron', 12, '#64748B')}
        </div>
      </div>

      <nav class="sidebar__nav">
        ${items.map(it => `
          <a href="${it.href}" class="sidebar__item ${it.id === activeId ? 'is-active' : ''}">
            ${NCUI.icon(it.icon)}
            <span style="flex:1">${it.label}</span>
            ${it.badge ? `<span class="badge">${it.badge}</span>` : ''}
          </a>
        `).join('')}
      </nav>

      <div class="sidebar__block" style="border-top:1px solid rgba(255,255,255,0.08);border-bottom:none;font-family:'JetBrains Mono',monospace;font-size:10px;color:#64748B;letter-spacing:0.4px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span>SISTEMA</span>
          <span style="display:flex;align-items:center;gap:5px">
            <span style="width:6px;height:6px;background:var(--nc-ok);border-radius:50%"></span>
            <span style="color:#94A3B8">ONLINE</span>
          </span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span>SINCR.</span>
          <span style="color:#94A3B8">14:42:08</span>
        </div>
      </div>

      <div class="sidebar__user">
        <div class="sidebar__avatar">RC</div>
        <div style="flex:1;min-width:0">
          <div style="color:#fff;font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Rafael Costa</div>
          <div style="color:#64748B;font-size:10px;font-family:'JetBrains Mono',monospace;letter-spacing:0.3px;text-transform:uppercase">Gestor · Qualidade</div>
        </div>
        ${NCUI.icon('logout', 14, '#64748B')}
      </div>
    </aside>
  `;
};

window.renderTopbar = function({ title, crumbs = [], actions = '' }) {
  return `
    <div class="app-topbar">
      <div style="flex:1;min-width:0">
        ${crumbs.length ? `<div class="app-crumbs">${crumbs.map((c, i) => `${i > 0 ? '<span>/</span>' : ''}<span style="color:${i === crumbs.length - 1 ? 'var(--nc-ink-2)' : 'var(--nc-muted)'}">${c}</span>`).join('')}</div>` : ''}
        <h1>${title}</h1>
      </div>
      ${actions}
    </div>
  `;
};
