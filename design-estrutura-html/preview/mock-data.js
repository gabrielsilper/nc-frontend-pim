// NC Control — mock data and small render helpers shared by every preview screen

window.NC_MOCK = (() => {
  const users = [
    { id: 'u01', name: 'Rafael Costa',     role: 'GESTOR',      initials: 'RC', email: 'rafael.costa@planta-pim.com.br' },
    { id: 'u02', name: 'Juliana Pereira',  role: 'RESPONSAVEL', initials: 'JP', email: 'juliana.pereira@planta-pim.com.br' },
    { id: 'u03', name: 'André Moura',      role: 'RESPONSAVEL', initials: 'AM', email: 'andre.moura@planta-pim.com.br' },
    { id: 'u04', name: 'Camila Nogueira',  role: 'OPERADOR',    initials: 'CN', email: 'camila.n@planta-pim.com.br' },
    { id: 'u05', name: 'Eduardo Tavares',  role: 'OPERADOR',    initials: 'ET', email: 'eduardo.t@planta-pim.com.br' },
  ];

  const ncs = [
    { num: 'NC-2026-0214', title: 'Torque fora de especificação no parafuso M8',     sev: 'CRITICA', status: 'ABERTA',                 line: 'Linha 03',   sector: 'Montagem',  age: '14 min',  overdue: false, assigned: null,   opened: '24/04 14:28', openedBy: 'u05' },
    { num: 'NC-2026-0213', title: 'Solda fria em placa PCB lote #88213',             sev: 'ALTA',    status: 'EM_TRATAMENTO',          line: 'Linha 01',   sector: 'SMT',       age: '2 h 12 min', overdue: false, assigned: 'u02', opened: '24/04 12:30', openedBy: 'u04' },
    { num: 'NC-2026-0212', title: 'Embalagem com código de lote ilegível',           sev: 'MEDIA',   status: 'EM_TRATAMENTO',          line: 'Linha 07',   sector: 'Embalagem', age: '5 h',     overdue: true,  assigned: 'u03', opened: '24/04 09:40', openedBy: 'u05' },
    { num: 'NC-2026-0211', title: 'Bancada de inspeção sem calibração válida',       sev: 'ALTA',    status: 'AGUARDANDO_VERIFICACAO', line: 'Insp. Final',sector: 'Qualidade', age: '1 d',     overdue: false, assigned: 'u02', opened: '23/04 15:08', openedBy: 'u02' },
    { num: 'NC-2026-0210', title: 'Material incorreto entregue ao estoque — peça X44', sev: 'MEDIA', status: 'EM_TRATAMENTO',          line: 'Recebimento',sector: 'Logística', age: '1 d 4h',  overdue: false, assigned: 'u03', opened: '23/04 10:12', openedBy: 'u04' },
    { num: 'NC-2026-0209', title: 'Rota de fuga da Linha 02 obstruída por pallets',  sev: 'CRITICA', status: 'AGUARDANDO_VERIFICACAO', line: 'Linha 02',   sector: 'Segurança', age: '2 d',     overdue: false, assigned: 'u02', opened: '22/04 16:45', openedBy: 'u05' },
    { num: 'NC-2026-0208', title: 'Desvio dimensional ±0,02 mm em eixo usinado',     sev: 'BAIXA',   status: 'ENCERRADA',              line: 'Usinagem',   sector: 'Produção',  age: '3 d',     overdue: false, assigned: 'u03', opened: '21/04 11:20', openedBy: 'u04' },
    { num: 'NC-2026-0207', title: 'Falta de EPI (óculos) no posto 14',               sev: 'ALTA',    status: 'ENCERRADA',              line: 'Linha 05',   sector: 'Segurança', age: '3 d',     overdue: false, assigned: 'u02', opened: '21/04 08:05', openedBy: 'u01' },
    { num: 'NC-2026-0206', title: 'Etiqueta de rastreabilidade ausente em pallet',   sev: 'MEDIA',   status: 'ABERTA',                 line: 'Expedição',  sector: 'Logística', age: '3 d',     overdue: true,  assigned: null,   opened: '21/04 07:18', openedBy: 'u04' },
    { num: 'NC-2026-0205', title: 'Desvio de umidade na sala limpa (63% rh)',        sev: 'ALTA',    status: 'CANCELADA',              line: 'Sala Limpa', sector: 'Processo',  age: '4 d',     overdue: false, assigned: 'u02', opened: '20/04 22:00', openedBy: 'u05' },
  ];

  const kpis = [
    { label: 'NCs ABERTAS', value: 47, delta: '+3 vs. semana anterior', tone: 'neutral' },
    { label: 'CRÍTICAS/ALTAS EM ABERTO', value: 12, delta: '2 sem responsável atribuído', tone: 'critical' },
    { label: 'PRAZO VENCIDO', value: 5, delta: 'ação imediata necessária', tone: 'warning' },
    { label: 'ENCERRADAS EM ABRIL', value: 68, delta: '+18% vs. março', tone: 'ok' },
  ];

  const ranking = [
    { type: 'Produto',  count: 34, delta: '+8',  bar: 100 },
    { type: 'Processo', count: 26, delta: '+2',  bar: 76 },
    { type: 'Material', count: 18, delta: '-3',  bar: 53 },
  ];

  return { users, ncs, kpis, ranking };
})();

// ---- render helpers ----
window.NCUI = {
  sevBadge(sev, compact) {
    const labels = { CRITICA: 'CRÍTICA', ALTA: 'ALTA', MEDIA: 'MÉDIA', BAIXA: 'BAIXA' };
    return `<span class="nc-badge sev-${sev} ${compact ? 'nc-badge--compact' : ''}"><span class="dot"></span>${labels[sev]}</span>`;
  },
  statusBadge(st, compact) {
    const labels = {
      ABERTA: 'ABERTA', EM_TRATAMENTO: 'EM TRATAMENTO',
      AGUARDANDO_VERIFICACAO: 'AGUARDANDO VERIF.', ENCERRADA: 'ENCERRADA', CANCELADA: 'CANCELADA',
    };
    return `<span class="nc-badge st-${st} ${compact ? 'nc-badge--compact' : ''}">${labels[st]}</span>`;
  },
  caStatusBadge(st) {
    const labels = { PENDENTE: 'PENDENTE', EM_ANDAMENTO: 'EM ANDAMENTO', CONCLUIDA: 'CONCLUÍDA' };
    return `<span class="nc-badge nc-badge--compact st-${st}">${labels[st]}</span>`;
  },
  overdueBadge() {
    return `<span class="nc-badge nc-badge--overdue"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 2L2 22h20L12 2z"/><line x1="12" y1="9" x2="12" y2="14"/></svg>Prazo vencido</span>`;
  },
  userById(id) { return NC_MOCK.users.find(u => u.id === id); },
  assignedChip(userId) {
    if (!userId) return `<span class="tag-pill">— não atribuído</span>`;
    const u = NCUI.userById(userId);
    return `<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--nc-ink)"><span style="width:20px;height:20px;background:#334155;color:#fff;display:grid;place-items:center;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:600;border-radius:2px">${u.initials}</span>${u.name}</span>`;
  },
  icon(name, size = 16, stroke = 'currentColor') {
    const paths = {
      grid:  '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
      list:  '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
      inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
      check: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
      chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
      plus:  '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
      download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
      search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
      chevron: '<polyline points="6 9 12 15 18 9"/>',
      arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
      arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
      clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
      user:  '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
      more:  '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
      edit:  '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
      warn:  '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      tag:   '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`;
  },
};
