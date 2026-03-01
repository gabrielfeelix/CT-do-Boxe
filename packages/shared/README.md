# @ct-boxe/shared

Código compartilhado entre as plataformas web (Next.js) e mobile (React Native).

## Estrutura

```
src/
├── types/           # Tipos TypeScript do Supabase e domínio
├── validations/     # Schemas Zod para validação de dados
├── utils/           # Funções utilitárias
└── constants/       # Constantes compartilhadas
```

## Uso

### No projeto web (Next.js)

```typescript
import { aulaFormSchema } from '@ct-boxe/shared/validations'
import { formatCurrency } from '@ct-boxe/shared/utils'
import { ROUTES } from '@ct-boxe/shared/constants'
```

### No projeto mobile (React Native)

```typescript
import { aulaFormSchema } from '@ct-boxe/shared/validations'
import { formatCurrency } from '@ct-boxe/shared/utils'
```

## Princípios

- ✅ **Platform-agnostic**: Nenhuma dependência de React, React Native ou DOM
- ✅ **Type-safe**: Todo código é tipado com TypeScript
- ✅ **Validated**: Schemas Zod para runtime validation
- ✅ **DRY**: Evita duplicação de código entre plataformas
