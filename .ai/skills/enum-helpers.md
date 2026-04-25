---
name: enum-helpers
description: Padronização de enums do backend para filtros, selects e labels reutilizáveis.
---

## Enums do Backend

Sempre seguir enums do backend.

Nunca hardcodar labels espalhadas no HTML.

## Selects / Filtros

Criar helper reutilizável por enum.

Exemplo desejado:

statusOptions = enumToOptions(StatusEnum)

Retorno:

[
  { value: 1, label: 'Ativo' },
  { value: 2, label: 'Inativo' }
]

## Regra

Sempre preferir helper reutilizável ao invés de arrays manuais longos.