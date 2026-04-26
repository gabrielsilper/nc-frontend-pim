# REVIEW-ALL — Bugs e fluxos pendentes

Documento consolidado de pontos identificados em revisão manual nos
projetos `nc-frontend-pim` e `nc-control-backend`. Cada item indica o
status atual no código e a ação dividida entre **Frontend** e
**Backend** quando aplicável.

Legenda de status: ✅ feito · 🟡 parcial · ❌ não feito

---

## 1. Operador (Carla Souza) não deve ver o dashboard

- Status FE: ❌
- Status BE: ✅ (endpoints `/counts` e `/ranking` já protegidos por
  `Profile.GESTOR` — devolvem 403 hoje, mas o FE não trata e a tela
  quebra)

**Frontend**
- `src/app/pages/login/login.page.ts:37` — redirecionar segundo o
  perfil:
  - `GESTOR` → `/app/dashboard`
  - `RESPONSAVEL` → `/app/minha-fila`
  - `OPERADOR` → `/app/ncs`
- `src/app/shared/components/sidebar/sidebar.component.html:19-27` —
  esconder o link "Dashboard" quando
  `currentUser().profile !== Profile.GESTOR`.
- Adicionar guard de perfil em `/app/dashboard` (novo
  `src/app/core/guards/role.guard.ts` recebendo lista de perfis
  permitidos).

**Backend**
- Nenhuma ação.

---

## 2. Lista de NC no dashboard deve permitir entrar na NC

- Status FE: ❌  ·  BE: n/a

**Frontend**
- `src/app/pages/dashboard/dashboard.page.html:58-77` — adicionar
  `[routerLink]="['/app/ncs', n.id]"` e `cursor-pointer` na linha,
  seguindo o padrão de
  `src/app/pages/nc-lista/nc-lista.page.html:104-106`.

---

## 3. Atribuição: exigir responsável **e** prazo antes de EM_TRATAMENTO

- Status FE: ❌  ·  BE: ❌
- Regra: a transição `ABERTA → EM_TRATAMENTO` só pode acontecer
  quando **ambos** estiverem preenchidos: `assignedToId`
  (responsável) e `dueDate` (prazo). Faltando qualquer um dos dois,
  bloquear no FE e no BE.

**Frontend**
- `src/app/pages/nc-detalhe/nc-detalhe.page.html` (modal de
  atribuição, ~ linhas 401-421):
  - Select de responsável marcado obrigatório (`required`,
    feedback visual).
  - Adicionar input de `dueDate` (formato `dd/MM/aaaa` —
    ver item 4) também obrigatório.
  - Botão "Confirmar" desabilitado enquanto qualquer um dos dois
    estiver vazio.
- `src/app/pages/nc-detalhe/nc-detalhe.page.ts:283-300`
  `confirmAssign()`:
  - Validar `selectedUserId` **e** `dueDate` antes de submeter.
  - Enviar `{ assignedToId, dueDate }` em uma única chamada.

**Backend**
- `src/services/non-conformity.service.ts:135-142` `assign()`:
  aceitar `dueDate` no payload e exigir que **tanto `userId`
  quanto `dueDate`** estejam presentes para transicionar para
  `EM_TRATAMENTO`. Caso contrário, devolver 400.
- Atualizar schema/DTO do assign para tornar `dueDate`
  obrigatório nesse fluxo.

> Relacionado ao item 2 do `nc-control-backend/REVIEW-TO-DO.md`
> (transição automática no assign).

---

## 4. Ajeitar formato de data — display **e** inputs

- Status FE: 🟡  ·  BE: n/a

**Display (já OK)**
- `src/app/pages/nc-detalhe/nc-detalhe.page.html:305`
  (`a.deadline | date:'dd/MM/yyyy'`)
- `src/app/pages/nc-detalhe/nc-detalhe.page.html:351`
  (`n.dueDate | date:'dd/MM/yyyy HH:mm'`)
- `src/app/pages/dashboard/dashboard.page.ts:77`
  (`toLocaleDateString('pt-BR')`)

**Inputs (a corrigir)**
- **Prazo da NC** — `nc-detalhe.page.html:343`
  `<input type="date" lang="pt-BR">`. O `lang` é ignorado pelo
  HTML5 e o input segue o locale do navegador (mostra
  `mm/dd/aaaa` em muitos casos).
- **Prazo do plano de ação** — `nc-detalhe.page.html:274`
  mesmo problema.

**Frontend (ações)**
- Trocar `<input type="date">` nos dois pontos por input com
  máscara `dd/MM/aaaa` (ex.: `ngx-mask`) com parser que
  converte para ISO (`new Date(...).toISOString()`) antes de
  enviar ao backend.
- Em paralelo, registrar `LOCALE_ID` como `pt-BR` em
  `src/app/app.config.ts`
  (`registerLocaleData(localePt)` +
  `{ provide: LOCALE_ID, useValue: 'pt-BR' }`) — isso melhora
  pipes e `toLocaleDateString`, mas **não** muda o formato do
  `input type=date`. A máscara é o que resolve.

**Backend**
- Nenhuma ação (datas continuam ISO).

---

## 5. Plano de ação só pode ser preenchido pelo responsável atribuído

- Status FE: ❌  ·  BE: ❌

**Frontend**
- `src/app/pages/nc-detalhe/nc-detalhe.page.{ts,html}` (bloco
  ações corretivas):
  - Botão "Concluir" e formulário de evidência visíveis apenas
    quando `action.assigneeId === currentUser().id`.
  - Para os demais usuários, manter a ação visível somente em
    leitura.

**Backend**
- Criar `PATCH /corrective-actions/:id` com guard que valide
  `req.user.id === action.assigneeId` antes de aceitar mudanças
  em `status`, `evidence` ou `finishedAt`.
- Validar no service que `status = CONCLUIDA` só é aceita se
  `evidence` estiver preenchido.

> Relacionado ao item 8 do `nc-control-backend/REVIEW-TO-DO.md`
> (CRUD completo de ações corretivas).

---

## 6. Responsável precisa ter a tela "Minha Fila"

- Status FE: ❌  ·  BE: ❌

**Frontend**
- Criar `src/app/pages/minha-fila/minha-fila.page.{ts,html}`.
- Rota `/app/minha-fila` em `src/app/app.routes.ts`.
- Link no `sidebar.component.html` visível quando
  `profile === RESPONSAVEL`.
- Consumir
  `NonConformityService.list({ assignedToId: currentUser().id, order: 'ASC' })`
  enquanto o endpoint dedicado não existe; ordenar vencidas no
  topo no cliente como fallback.
- Cada card mostra: `title`, `severity`, `dueDate` (formato
  brasileiro), botão para atualizar status; clique leva para
  `/app/ncs/:id`.

**Backend**
- Criar `GET /non-conformities/my-queue` ordenando por
  `dueDate ASC NULLS LAST` com vencidas primeiro. Acessível a
  qualquer usuário autenticado, filtrando por `req.user.id`.

> Relacionado ao item 4 do `nc-control-backend/REVIEW-TO-DO.md`
> (ordenação por `dueDate`).

---

## 7. Plano de ação — permitir associar a um responsável

- Status FE: ❌  ·  BE: ✅ (schema já exige `assigneeId: uuid()` em
  `src/schemas/create-corrective-action.schema.ts:19`)

**Frontend**
- `nc-detalhe.page.html` (form de nova ação, ~ linhas 270-280):
  adicionar `<select>` de `assigneeId` populado por
  `UserService.listAll()`, valor obrigatório.
- `nc-detalhe.page.ts:313` `addAction()`: enviar o `assigneeId`
  selecionado em vez de `currentUser().id`.

**Backend**
- Nenhuma ação (schema já aceita).

---

## 8. Plano de ação não está sendo persistido / visualizado

- Status FE: 🟡  ·  BE: ❌ (bug)

**Sintoma**
O responsável cria a ação e vê o item na lista (estado local),
mas após recarregar a tela ou voltar para o detalhe da NC a
lista volta vazia.

**Backend (causa provável)**
- `src/services/corrective-action.service.ts` `findbyNc()` faz
  `repository.findBy({ nonConformity })` passando a **entidade
  inteira**. TypeORM resolve `findBy` pelas colunas (na entidade
  a coluna real é `nonConformityId` / `nc_id`), então a query
  nunca retorna registros.
- **Correção**: trocar para
  `findBy({ nonConformityId })` (string UUID) ou usar
  `find({ where: { nonConformityId }, relations: ['assignee'] })`
  para também devolver o nome do responsável da ação.
- Confirmar via psql que os registros entraram em
  `corrective_actions`
  (`SELECT * FROM corrective_actions WHERE nc_id = '<id>'`) — o
  `create()` aparenta gravar via relação, mas vale a checagem.

**Frontend**
- Após `createCorrectiveAction` retornar, refazer
  `correctiveActions(ncId)` em vez de só
  `actions.update(list => [...list, ca])` — garante que o que
  está na tela é o que está no banco.
- Tratar erro do POST de forma visível (hoje
  `error: () => savingAction.set(false)` não mostra nada ao
  usuário).

---

## Pontos correlatos já documentados

`nc-control-backend/REVIEW-TO-DO.md` cobre, sem duplicar aqui:

- Item 2 — transição automática no assign (relacionado ao 3).
- Item 4 — ordenação por `dueDate` (relacionado ao 6).
- Item 8 — CRUD completo de ações corretivas (relacionado ao 5).
- Item 10 — endpoint de histórico (RF14, fora do escopo deste
  review).
- Item 13 — dashboard para perfis não-GESTOR (relacionado ao 1).
