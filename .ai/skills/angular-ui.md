---
name: angular-ui
description: Padrões de interface Angular com TailwindCSS e organização visual.
---

## Naming

Páginas:

xxxxPage

Ex:

- LoginPage
- DashboardPage

Componentes reutilizáveis:

xxxComponent

Ex:

- SidebarComponent
- UserCardComponent

## Estrutura de pastas

```
src/app/
  core/
    guards/
    interceptors/
    services/
    models/
  pages/
    login/
    dashboard/
    ncs/
    minha-fila/
  shared/
    components/
```

Regras:

- Páginas ficam em `src/app/pages/<nome-da-pagina>/` — sem subpasta de feature/domínio antes
- Nunca criar `features/auth/login/`, `features/ncs/list/` ou qualquer camada intermediária
- Cada página fica diretamente em `pages/<nome>/`
- Ex: `pages/login/`, `pages/dashboard/`, `pages/nc-lista/`, `pages/nc-detalhe/`

## Layout

Sempre usar TailwindCSS.

Preferir:

- flex
- gap consistente
- spacing limpo
- responsividade

## Estrutura de arquivo por componente/página

Todo component ou page:

- component.ts / page.ts
- component.html / page.html

## HTML

Templates limpos.

Evitar lógica complexa no HTML.

Mover lógica para TypeScript quando necessário.

## Elementos proibidos nas páginas

- **Nunca adicionar footer** em nenhuma página — nem rodapé com build, versão, unidade ou qualquer texto fixo de rodapé
- **Nunca adicionar banners ou notices operacionais** (ex: "Aviso Operacional", "Manutenção programada") — esses elementos não existem no sistema
- Ao revisar código gerado, remover qualquer um desses elementos caso estejam presentes
