# NC Control — Frontend

Interface web para o sistema de gestão de Não Conformidades. Construída com **Angular 21**, **TypeScript** e **TailwindCSS**.

> **Pré-requisito:** o backend precisa estar rodando em `http://localhost:3000` para que as funcionalidades do sistema funcionem. Consulte o [README do backend](../nc-control-backend/README.md) para subir a API antes de iniciar o frontend.

---

## Início Rápido

### Passo 1 — Instale as dependências

```bash
npm install
```

### Passo 2 — Inicie o servidor de desenvolvimento

```bash
npm start
```

Aguarde a compilação e acesse **`http://localhost:4200`**.

### Passo 3 — Faça login

Use um dos usuários criados automaticamente pela seed do backend:

| Email | Senha | Perfil |
|-------|-------|--------|
| `ana.martins@nc-control.local` | `12345678` | GESTOR |
| `bruno.costa@nc-control.local` | `12345678` | RESPONSAVEL |
| `diego.ferreira@nc-control.local` | `12345678` | RESPONSAVEL |
| `carla.souza@nc-control.local` | `12345678` | OPERADOR |

> Cada perfil libera rotas diferentes — veja a seção [Acesso por perfil](#acesso-por-perfil).

---

## Tecnologias

- Angular 21 + TypeScript 5.9
- Signals — gerenciamento de estado reativo
- RxJS 7.8
- TailwindCSS 4 — estilização
- Vitest — testes unitários
- Prettier — formatação de código

---

## Pré-requisitos

- [Node.js 20+](https://nodejs.org/)
- Backend rodando em `http://localhost:3000` (veja [nc-control-backend](../nc-control-backend/README.md))

---

## Como rodar — Desenvolvimento Local

### Instalar e iniciar

```bash
npm install
npm start
```

A aplicação estará disponível em **`http://localhost:4200`**.

Alterações nos arquivos são refletidas automaticamente sem reiniciar.

### Build de produção

```bash
npm run build
```

Os arquivos gerados ficam em `dist/`.

### Watch mode (build contínuo)

```bash
npm run watch
```

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run watch` | Build contínuo em modo desenvolvimento |
| `npm test` | Executa os testes unitários com Vitest |

---

## Acesso por perfil

O sistema usa controle de acesso baseado em perfil. Cada rota é protegida por guards de autenticação e de papel.

### GESTOR

| Rota | Descrição |
|------|-----------|
| `/app/dashboard` | Painel com contagens e ranking de NCs por tipo |
| `/app/ncs` | Listar todas as Não Conformidades com filtros |
| `/app/ncs/nova` | Registrar nova NC |
| `/app/ncs/:id` | Detalhe e edição de NC |
| `/app/usuarios` | Gerenciar usuários do sistema |
| `/app/usuarios/novo` | Criar novo usuário |
| `/app/usuarios/:id` | Editar usuário |
| `/app/perfil` | Perfil do próprio usuário |

### RESPONSAVEL

| Rota | Descrição |
|------|-----------|
| `/app/minha-fila` | NCs atribuídas ao usuário logado |
| `/app/ncs` | Listar Não Conformidades |
| `/app/ncs/nova` | Registrar nova NC |
| `/app/ncs/:id` | Detalhe e edição de NC |
| `/app/perfil` | Perfil do próprio usuário |

### OPERADOR

| Rota | Descrição |
|------|-----------|
| `/app/ncs` | Listar Não Conformidades |
| `/app/ncs/nova` | Registrar nova NC |
| `/app/ncs/:id` | Detalhe de NC |
| `/app/perfil` | Perfil do próprio usuário |

---

## Estrutura do Projeto

```
src/app/
├── core/
│   ├── guards/         # authGuard, roleGuard, appHomeGuard
│   ├── interceptors/   # authInterceptor — anexa o Bearer token nas requisições
│   ├── models/         # Interfaces e enums (NC, usuário, auth)
│   ├── services/       # auth, usuário, não conformidade, dashboard
│   └── utils/          # Utilitários (formatação de datas)
├── pages/
│   ├── login/
│   ├── dashboard/
│   ├── minha-fila/
│   ├── nc-lista/
│   ├── nc-nova/
│   ├── nc-detalhe/
│   ├── perfil/
│   ├── usuarios/
│   ├── usuarios-nova/
│   └── usuario-detalhe/
└── shared/
    └── components/
        ├── app-layout/     # Layout principal com sidebar
        ├── sidebar/        # Navegação lateral
        ├── status-badge/   # Indicador visual de status da NC
        ├── severity-badge/ # Indicador visual de severidade
        └── overdue-badge/  # Indicador de NC com prazo vencido
```
