---
name: backend-sync
description: Sincronização entre frontend Angular e backend existente.
---

## DTOs e Entidades

Sempre seguir exatamente os padrões do backend.

Se backend usa:

- UserDto
- UserEntity
- CreateUserRequest
- UserResponse

No frontend seguir mesmo padrão.

Nunca renomear campos sem necessidade.

## Requests e Responses

Adaptar sempre ao contrato real da API.

Tratar:

- paginação
- nullables
- arrays vazios
- enums
- responses aninhados

## Tipagem

Nunca usar any.

Sempre criar interfaces ou types corretos.

## Integração

Se existir backend Java/Spring:

seguir nomes e contratos existentes.