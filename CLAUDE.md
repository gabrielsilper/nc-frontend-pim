# CLAUDE.md

Este projeto utiliza Angular 21 + TypeScript + TailwindCSS.

## Regras Globais

Sempre seguir os arquivos:

- SKILL.md
- .ai/skills/*

## Stack Principal

- Angular 21
- TypeScript strict
- TailwindCSS
- Signals
- Services injetáveis

## Objetivo

Gerar código moderno, limpo, escalável e legível.

## Legibilidade

Todo código deve ser simples o suficiente para desenvolvedores junior e pleno entenderem facilmente.

Evitar:

- abstrações desnecessárias
- complexidade excessiva
- código verboso
- patterns exagerados

Preferir:

- nomes claros
- métodos pequenos
- responsabilidade única
- tipagem forte

## Angular

Sempre preferir:

- Standalone components
- inject()
- signals()
- computed()
- effect() somente quando necessário

## Separação de Arquivos

Todo component/page deve possuir:

- arquivo .ts
- arquivo .html

Nunca usar template inline.

## Estilo

Sempre usar TailwindCSS para interface.

## Estrutura de Pastas

Páginas ficam em `src/app/pages/<nome-da-pagina>/` — sem subpasta de domínio antes.

Correto: `pages/login/`, `pages/dashboard/`, `pages/nc-lista/`
Errado: `features/auth/login/`, `features/ncs/list/`

## Ao gerar código novo

Antes de criar qualquer arquivo, verificar padrões existentes no projeto e seguir consistência local.