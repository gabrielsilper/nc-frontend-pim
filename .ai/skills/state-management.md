---
name: state-management
description: Gerenciamento de estado local e global com Angular Signals.
---

## Estado Local (Página)

Usar signals para:

- loading
- filtros
- item selecionado
- paginação local

## Estado Global

Usar services injetáveis com signals para:

- auth
- usuário logado
- sidebar aberta

## Preferências

Preferir:

- signal()
- computed()

Usar effect() somente quando necessário.

Evitar BehaviorSubject se signal resolver bem.