# TODO Frontend — QualidadePIM

Sistema de Registro de Não Conformidades  
Stack: Angular 21 · TypeScript strict · TailwindCSS · Signals

---

## Fases de entrega

| Fase | Foco | Aulas |
|------|------|-------|
| 1 | Setup e estrutura base | 1–3 |
| 2 | Autenticação end-to-end | 4–5 |
| 3 | Abertura e listagem de NCs | 6–8 |
| 4 | Atribuição, status, plano de ação e fila | 9–12 |
| 5 | Dashboard, polimento e apresentação | 13–15 |

---

## FASE 1 — Setup e estrutura base

- [x] Criar projeto Angular com Tailwind (`ng new --style=tailwind`)
- [x] Configurar `tsconfig` com `strict: true`
- [x] Criar estrutura de pastas:
  ```
  src/app/
    core/
      guards/
      interceptors/
      services/
      models/
    features/
      auth/
      dashboard/
      ncs/
      minha-fila/
    shared/
      components/
  ```
- [x] Configurar `app.routes.ts` com lazy loading por feature
- [x] Configurar `app.config.ts` com `provideRouter`, `provideHttpClient` e interceptors

---

## FASE 2 — Autenticação

### Modelos

- [x] `src/app/core/models/profile.enum.ts`
  ```ts
  export enum Profile {
    OPERADOR,      // 0
    RESPONSAVEL,   // 1
    GESTOR,        // 2
  }
  ```

- [x] `src/app/core/models/user.model.ts`
  ```ts
  import { Profile } from './profile.enum'

  // shape completo retornado por GET /users
  export interface ResponseUserDTO {
    id: string        // UUID
    name: string
    email: string
    profile: Profile
  }

  // payload do JWT — vem dentro de ResponseTokensDTO.user
  export interface AuthUserDTO {
    id: string
    profile: Profile
  }
  ```

- [x] `src/app/core/models/auth.model.ts`
  ```ts
  import { AuthUserDTO } from './user.model'

  export interface LoginDTO {
    email: string
    password: string
  }

  export interface ResponseTokensDTO {
    accessToken: string
    refreshToken: string
    user: AuthUserDTO
  }
  ```

### Service

- [x] `src/app/core/services/auth.service.ts`
  - `currentUser = signal<AuthUserDTO | null>(null)`
  - `isAuthenticated = computed(() => !!currentUser())`
  - `login(data: LoginDTO): Observable<ResponseTokensDTO>` — salva `accessToken` e `refreshToken` no localStorage, atualiza signal com `response.user`
  - `logout()` — limpa localStorage, reseta signal, redireciona para `/login`
  - `loadUserFromToken()` — lê JWT salvo e popula signal (chamado no bootstrap)

### Interceptor

- [x] `src/app/core/interceptors/auth.interceptor.ts`
  - Injeta `Authorization: Bearer <accessToken>` em todas as requisições
  - Erro 401 → chama `auth.logout()`

### Guard

- [x] `src/app/core/guards/auth.guard.ts` (`CanActivateFn`)
  - Rota sem token válido → redireciona para `/login`

### Página

- [x] `src/app/pages/login/login.page.ts` + `login.page.html`
  - Formulário reativo com campos `email` e `password` (nomes do backend)
  - Validação em tempo real (required, email válido, mínimo 8 e máximo 25 chars no password)
  - Estado de loading: `loading = signal(false)`
  - Feedback visual de erro na resposta da API
  - Redireciona para `/app/dashboard` após login bem-sucedido
  - Se já autenticado, redireciona direto para dashboard

### Rota

```
/login  →  LoginPage  (pública)
/app/*  →  protegida por authGuard
```

---

## FASE 3 — Abertura e listagem de NCs

### Modelos

- [ ] `src/app/core/models/type-nc.enum.ts`
  ```ts
  export enum TypeNc {
    PRODUTO,    // 0
    PROCESSO,   // 1
    MATERIAL,   // 2
    SEGURANÇA,  // 3
    OUTRO,      // 4
  }
  ```

- [ ] `src/app/core/models/severity-nc.enum.ts`
  ```ts
  export enum SeverityNc {
    BAIXA,    // 0
    MEDIA,    // 1
    ALTA,     // 2
    CRITICA,  // 3
  }
  ```

- [ ] `src/app/core/models/status-nc.enum.ts`
  ```ts
  export enum StatusNc {
    ABERTA,                  // 0
    EM_TRATAMENTO,           // 1
    AGUARDANDO_VERIFICACAO,  // 2
    ENCERRADA,               // 3
    CANCELADA,               // 4
  }
  ```

- [ ] `src/app/core/models/non-conformity.model.ts`
  ```ts
  import { TypeNc } from './type-nc.enum'
  import { SeverityNc } from './severity-nc.enum'
  import { StatusNc } from './status-nc.enum'

  // shape exato retornado pela API
  export interface ResponseNonConformityDTO {
    id: string
    number: string
    title: string
    description: string
    type: TypeNc
    severity: SeverityNc
    status: StatusNc
    processLine: string
    department: string
    rootCause?: string
    createdById: string
    assignedToId?: string
    openedAt: Date
    dueDate?: Date
    closedAt?: Date | null
  }

  // resposta paginada de GET /ncs
  export interface ResponseNonConformitiesPageDTO {
    items: ResponseNonConformityDTO[]
    total: number
    page: number
    pageSize: number
    totalPages: number
    hasNext: boolean
  }

  // body de POST /ncs
  export interface CreateNonConformityDTO {
    title: string
    description: string
    type: TypeNc
    severity: SeverityNc
    processLine: string
    department: string
    rootCause?: string
    assignedToId?: string
  }

  // body de PATCH /ncs/:id
  export interface UpdateNonConformityDTO {
    title?: string
    description?: string
    type?: TypeNc
    severity?: SeverityNc
    status?: StatusNc
    processLine?: string
    department?: string
    rootCause?: string
    assignedToId?: string
  }

  // query params de GET /ncs
  export interface FindNonConformitiesQuery {
    page?: number
    pageSize?: number
    order?: 'ASC' | 'DESC'
    type?: number        // valor numérico do enum TypeNc
    severity?: number    // valor numérico do enum SeverityNc
    status?: number      // valor numérico do enum StatusNc
    assignedToId?: string
    expired?: boolean
    search?: string
  }
  ```

### Enum helpers

- [ ] `src/app/core/models/enum-options.ts`
  ```ts
  typeNcOptions: { value: TypeNc, label: string }[]
  severityNcOptions: { value: SeverityNc, label: string }[]
  statusNcOptions: { value: StatusNc, label: string }[]
  ```
  Nunca hardcodar labels no HTML — sempre importar daqui.

### Services

- [ ] `src/app/core/services/non-conformity.service.ts`
  - `list(query: FindNonConformitiesQuery): Observable<ResponseNonConformitiesPageDTO>` — params enviados via `HttpParams`
  - `findById(id: string): Observable<ResponseNonConformityDTO>`
  - `create(data: CreateNonConformityDTO): Observable<ResponseNonConformityDTO>`
  - `update(id: string, data: UpdateNonConformityDTO): Observable<ResponseNonConformityDTO>` — usado para atribuir responsável, atualizar status e encerrar

- [ ] `src/app/core/services/user.service.ts`
  - `listAll(): Observable<ResponseUserDTO[]>` — usado no select de `assignedToId` da `NcDetailPage`

### Componentes compartilhados

- [ ] `src/app/shared/components/status-badge/status-badge.component.ts` + `.html`
  - Input: `status: StatusNc`
  - Cores: `ABERTA`=azul, `EM_TRATAMENTO`=amarelo, `AGUARDANDO_VERIFICACAO`=laranja, `ENCERRADA`=verde, `CANCELADA`=cinza

- [ ] `src/app/shared/components/severity-badge/severity-badge.component.ts` + `.html`
  - Input: `severity: SeverityNc`
  - Cores: `BAIXA`=cinza, `MEDIA`=amarelo, `ALTA`=laranja, `CRITICA`=vermelho
  - Badge de prazo vencido separado: visível quando `dueDate < hoje && status !== StatusNc.ENCERRADA`

### Página — Listagem

- [ ] `src/app/features/ncs/ncs-list/ncs-list.page.ts` + `.html`
  - Rota: `/app/ncs`
  - `page = signal<ResponseNonConformitiesPageDTO | null>(null)`
  - `loading = signal(false)`
  - `query = signal<FindNonConformitiesQuery>({ page: 1, pageSize: 10 })`
  - Busca por texto no campo `search`
  - Filtros combinados AND: `status`, `severity`, `type` (selects com `enumOptions`, valor numérico enviado)
  - Botão "Limpar filtros" reseta o signal de query
  - Cada item mostra: `number`, `title`, `SeverityBadgeComponent`, `StatusBadgeComponent`, badge prazo vencido
  - Botão "Nova NC" leva para `/app/ncs/nova`
  - Clique na linha leva para `/app/ncs/:id`
  - Paginação usando `page`, `pageSize`, `totalPages` da resposta

### Página — Formulário de abertura

- [ ] `src/app/features/ncs/nc-form/nc-form.page.ts` + `.html`
  - Rota: `/app/ncs/nova`
  - Formulário reativo com campos: `title`, `description`, `type`, `severity`, `processLine`, `department`
  - Todos os campos obrigatórios
  - Selects de `type` e `severity` populados com `enumOptions` (nunca hardcodar)
  - `formDirty = signal(false)` — atualizado no `valueChanges`
  - `canDeactivateGuard`: se `formDirty() && !saved` → confirmar saída
  - Campo `number` gerado pelo backend — não exibir no form
  - Após criar: redireciona para `/app/ncs/:id`

### Guard

- [ ] `src/app/core/guards/can-deactivate.guard.ts` (`CanDeactivateFn`)
  - Interface `CanDeactivateComponent { canDeactivate(): boolean }`
  - `NcFormPage` implementa esta interface

---

## FASE 4 — Atribuição, status, plano de ação e fila

### Modelos

- [ ] `src/app/core/models/status-ca.enum.ts` *(trio)*
  ```ts
  export enum StatusCa {
    PENDENTE,      // 0
    EM_ANDAMENTO,  // 1
    CONCLUIDA,     // 2
  }
  ```

- [ ] `src/app/core/models/corrective-action.model.ts` *(trio)*
  ```ts
  import { StatusCa } from './status-ca.enum'

  // shape exato retornado pela API
  export interface ResponseCorrectiveActionDTO {
    id: string
    description: string
    status: StatusCa
    deadline: Date
    evidence?: string
    nonConformityId: string
    assigneeId: string
    finishedAt?: Date
    createdAt: Date
    updatedAt: Date
  }

  // body de POST /ncs/:id/corrective-actions
  export interface CreateCorrectiveActionDTO {
    description: string
    status: StatusCa
    deadline: string   // ISO 8601
    evidence?: string
    assigneeId: string
  }
  ```

### Service

- [ ] `src/app/core/services/corrective-action.service.ts` *(trio)*
  - `listByNc(nonConformityId: string): Observable<ResponseCorrectiveActionDTO[]>`
  - `create(nonConformityId: string, data: CreateCorrectiveActionDTO): Observable<ResponseCorrectiveActionDTO>`
  - `finish(id: string, evidence: string): Observable<ResponseCorrectiveActionDTO>`

### Página — Detalhe da NC

- [ ] `src/app/features/ncs/nc-detail/nc-detail.page.ts` + `.html`
  - Rota: `/app/ncs/:id`
  - `nc = signal<ResponseNonConformityDTO | null>(null)`
  - `loading = signal(false)`
  - Exibe todos os campos da NC (somente leitura)
  - **Bloco atribuição** (visível se `status === StatusNc.ABERTA`):
    - Select de usuários via `UserService.listAll()` — campo enviado como `assignedToId` (UUID)
    - Input de data para `dueDate`
    - Ao confirmar: chama `NonConformityService.update(id, { assignedToId, dueDate })`, status muda para `EM_TRATAMENTO` automaticamente pelo backend
  - **Bloco status** (visível se `status !== ENCERRADA && status !== CANCELADA`):
    - Select com transições válidas apenas (tabela abaixo)
    - Botão confirmar chama `NonConformityService.update(id, { status })`
  - **Bloco encerramento** (visível se `status === StatusNc.AGUARDANDO_VERIFICACAO`):
    - Textarea `rootCause` (obrigatório)
    - Botão "Encerrar NC" chama `NonConformityService.update(id, { rootCause, status: StatusNc.ENCERRADA })`
  - **Bloco plano de ação** *(trio)*: renderiza `CorrectiveActionsListComponent`

  **Regra de transições (bloquear no frontend também):**
  | Status atual | Transições permitidas |
  |---|---|
  | `ABERTA` | `EM_TRATAMENTO` (via atribuição) |
  | `EM_TRATAMENTO` | `AGUARDANDO_VERIFICACAO`, `CANCELADA` |
  | `AGUARDANDO_VERIFICACAO` | `ENCERRADA`, `EM_TRATAMENTO` |
  | `ENCERRADA` | nenhuma |
  | `CANCELADA` | nenhuma |

### Componente — Lista de ações corretivas *(trio)*

- [ ] `src/app/features/ncs/nc-detail/corrective-actions-list/corrective-actions-list.component.ts` + `.html`
  - Input: `nonConformityId: string`
  - `actions = signal<ResponseCorrectiveActionDTO[]>([])`
  - Lista ações com `assigneeId`, `deadline`, `status`
  - Botão "Concluir" visível apenas para o responsável da ação (`action.assigneeId === currentUser().id`)
  - Ao concluir: campo `evidence` obrigatório
  - Formulário inline para adicionar nova ação (gestor)

### Página — Plano de ação *(trio)*

- [ ] `src/app/features/ncs/nc-acoes/nc-acoes.page.ts` + `.html`
  - Rota: `/app/ncs/:id/acoes`
  - Versão dedicada da lista de ações corretivas
  - Mesmo comportamento do bloco embutido no detalhe

### Página — Minha Fila

- [ ] `src/app/features/minha-fila/minha-fila.page.ts` + `.html`
  - Rota: `/app/minha-fila`
  - Busca NCs filtrando por `assignedToId = currentUser().id`
  - `ncs = signal<ResponseNonConformityDTO[]>([])`
  - Ordenadas por `dueDate` mais próximo (`order: 'ASC'`)
  - NCs com `dueDate` vencido destacadas no topo com badge vermelho (`expired: true` no query)
  - Cada card mostra: `title`, `severity`, `dueDate`, botão rápido para atualizar `status`
  - Clique no card leva para `/app/ncs/:id`

---

## FASE 5 — Dashboard, polimento e apresentação

### Modelos

- [ ] `src/app/core/models/dashboard.model.ts`
  ```ts
  import { ResponseNonConformityDTO } from './non-conformity.model'
  import { TypeNc } from './type-nc.enum'

  export interface DashboardIndicators {
    totalOpen: number
    criticalOrHighOpen: number
    overdueWithoutClose: number
    closedThisMonth: number
    recent: ResponseNonConformityDTO[]                    // 10 mais recentes
    typeRanking: { type: TypeNc, total: number }[]        // top 3
  }
  ```

### Service

- [ ] `src/app/core/services/dashboard.service.ts`
  - `getIndicators(): Observable<DashboardIndicators>` — GET `/dashboard`

### Componente — Stat Card

- [ ] `src/app/shared/components/stat-card/stat-card.component.ts` + `.html`
  - Inputs: `title: string`, `value: number`, `color?: string`
  - Reutilizado no dashboard

### Página — Dashboard

- [ ] `src/app/features/dashboard/dashboard.page.ts` + `.html`
  - Rota: `/app/dashboard`
  - `indicators = signal<DashboardIndicators | null>(null)`
  - **Bloco 1 — 4 cards** (`StatCardComponent`):
    - Total de NCs abertas (`totalOpen`)
    - NCs críticas ou altas em aberto (`criticalOrHighOpen`)
    - NCs com prazo vencido sem encerramento (`overdueWithoutClose`)
    - NCs encerradas no mês (`closedThisMonth`)
  - **Bloco 2 — Lista das 10 NCs mais recentes** (`recent`):
    - `number`, `title`, `SeverityBadgeComponent`, `StatusBadgeComponent`
    - Clique leva para `/app/ncs/:id`
  - **Bloco 3 — Ranking top 3 tipos no mês** (`typeRanking`):
    - Exibido inline no dashboard (não em tela separada)

### Layout e navegação

- [ ] `src/app/shared/components/navbar/navbar.component.ts` + `.html`
  - Links: Dashboard, Não Conformidades, Minha Fila
  - Exibe `currentUser().name` (buscado via `UserService` pelo id do token)
  - Botão logout

- [ ] `src/app/shared/components/sidebar/sidebar.component.ts` + `.html` *(opcional)*
  - `open = signal(false)`

### Polimento

- [ ] Empty states em todas as listas
- [ ] Loading states com spinner/skeleton em cada página
- [ ] Tratamento de erros HTTP: 401 → logout, 500 → mensagem amigável
- [ ] Responsividade: funcional em telas 1024px ou mais (RNF05)
- [ ] `canDeactivate` testado no form de NC

---

## Estrutura de rotas final

```ts
// app.routes.ts
[
  { path: 'login', component: LoginPage },
  {
    path: 'app',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',     loadComponent: () => DashboardPage },
      { path: 'ncs',           loadComponent: () => NcsListPage },
      { path: 'ncs/nova',      loadComponent: () => NcFormPage, canDeactivate: [canDeactivateGuard] },
      { path: 'ncs/:id',       loadComponent: () => NcDetailPage },
      { path: 'ncs/:id/acoes', loadComponent: () => NcAcoesPage },  // trio
      { path: 'minha-fila',    loadComponent: () => MinhaFilaPage },
    ]
  },
  { path: '**', redirectTo: 'login' }
]
```

---

## Checklist de regras transversais

**Angular / código:**
- [ ] Nunca usar `any` — sempre criar interface ou type
- [ ] Nunca template inline — sempre `.html` separado
- [ ] Nunca usar `BehaviorSubject` quando `signal()` resolve
- [ ] Nunca hardcodar labels de enum no HTML — importar de `enum-options.ts`
- [ ] Sempre usar `inject()` em vez de constructor injection
- [ ] Formulários reativos — nunca template-driven
- [ ] `effect()` apenas quando `computed()` não resolver
- [ ] Todas as páginas: `loading = signal(false)`, tratar erro na requisição

**Backend-sync — obrigatório em todo código gerado:**
- [ ] Nomes de interfaces e DTOs espelham o backend: `ResponseNonConformityDTO`, `ResponseCorrectiveActionDTO`, `ResponseUserDTO`, `ResponseTokensDTO`, `AuthUserDTO`, `CreateNonConformityDTO`, `UpdateNonConformityDTO`, `CreateCorrectiveActionDTO`, `LoginDTO`, `FindNonConformitiesQuery`
- [ ] Nomes de enums espelham o backend: `Profile`, `TypeNc`, `SeverityNc`, `StatusNc`, `StatusCa`
- [ ] Enums são numéricos — os valores enviados para a API como query param são os números (0, 1, 2...)
- [ ] IDs são `string` (UUID) — nunca `number`
- [ ] Campos de data são `Date` nas responses e `string` ISO 8601 nos requests
- [ ] Campos opcionais usam `?` (undefined), não `| null`, exceto `closedAt` que é `Date | null`
- [ ] Nome do campo de login é `password`, não `senha`
- [ ] Token retornado é `accessToken` — há também `refreshToken` no `ResponseTokensDTO`
- [ ] Filtros de listagem seguem `FindNonConformitiesQuery`: `search`, `type`, `severity`, `status`, `assignedToId`, `expired`, `page`, `pageSize`, `order`
- [ ] `UserService.listAll()` é o único lugar para buscar lista de usuários — nunca duplicar dentro de outro service
