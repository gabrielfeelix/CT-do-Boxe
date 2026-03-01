# Sistema CT-Boxe

Sistema completo de gerenciamento do **Centro de Treinamento de Boxe — Equipe Argel Riboli**.

## 📦 Monorepo

Este é um monorepo que contém todas as plataformas do sistema CT-Boxe:

```
sistema-ct-boxe/
├── packages/
│   ├── web/          # 🌐 Aplicação web (Next.js)
│   ├── app/          # 📱 Aplicação mobile (React Native + Expo)
│   └── shared/       # 📚 Código compartilhado (types, validations, utils)
├── package.json
└── pnpm-workspace.yaml
```

## 🚀 Quick Start

### Pré-requisitos

- Node.js >= 18.0.0
- pnpm >= 8.0.0

```bash
npm install -g pnpm@8.15.0
```

### Instalação

```bash
# Clone o repositório
git clone https://github.com/gabrielfeelix/sistema-ct-boxe.git
cd sistema-ct-boxe

# Instale todas as dependências (de todos os packages)
pnpm install
```

### Desenvolvimento

```bash
# Rodar aplicação web
pnpm dev:web

# Rodar aplicação mobile
pnpm dev:app

# Rodar linting em todos os packages
pnpm lint

# Rodar typecheck em todos os packages
pnpm typecheck
```

## 📱 Plataformas

### Web ([packages/web](./packages/web))

Aplicação web administrativa construída com:
- **Framework**: Next.js 16.1.6 (App Router)
- **UI**: React 19 + Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Pagamentos**: Mercado Pago API
- **Validação**: Zod

**Funcionalidades:**
- ✅ Gestão de alunos e candidatos
- ✅ Aulas (individuais e em grupo)
- ✅ Séries de aulas recorrentes
- ✅ Controle de presenças
- ✅ Planos e contratos
- ✅ Pagamentos via PIX (Mercado Pago)
- ✅ Dashboard de métricas

**Rodar localmente:**
```bash
cd packages/web
cp .env.example .env.local
# Configure suas variáveis de ambiente
pnpm dev
```

Acesse: http://localhost:3000

### Mobile ([packages/app](./packages/app))

Aplicação mobile para alunos construída com:
- **Framework**: React Native + Expo 55
- **UI**: Gluestack UI v2 + NativeWind
- **Database**: Supabase
- **Pagamentos**: Mercado Pago SDK

**Funcionalidades:**
- ✅ Perfil do aluno
- ✅ Agenda de aulas
- ✅ Check-in em aulas
- ✅ Histórico de treinos
- ✅ Pagamentos via PIX

**Rodar localmente:**
```bash
cd packages/app
cp .env.example .env
# Configure suas variáveis de ambiente
pnpm start
```

### Shared ([packages/shared](./packages/shared))

Biblioteca compartilhada entre web e mobile:
- **Types**: Tipos TypeScript do Supabase e domínio
- **Validations**: Schemas Zod para validação
- **Utils**: Funções utilitárias
- **Constants**: Constantes compartilhadas

## 🛠️ Stack Técnica

| Camada | Web | Mobile | Shared |
|--------|-----|--------|--------|
| Framework | Next.js 16 | React Native + Expo 55 | TypeScript |
| UI | Tailwind v4 | NativeWind + Gluestack UI | - |
| State | React Server Components | React Hooks | - |
| Database | Supabase (SSR) | Supabase | - |
| Validação | Zod | Zod | Zod |
| Payments | Mercado Pago API | Mercado Pago SDK | - |
| Package Manager | pnpm workspaces | pnpm workspaces | pnpm |

## 📂 Estrutura de Dados (Supabase)

Principais tabelas:
- `alunos` - Cadastro de alunos ativos
- `candidatos` - Leads e candidatos a aluno
- `aulas` - Aulas agendadas (individuais e grupo)
- `series_aulas` - Séries de aulas recorrentes
- `presencas` - Controle de presença em aulas
- `planos` - Planos de treino (Mensal, Semanal)
- `contratos` - Contratos ativos dos alunos
- `pagamentos` - Histórico de pagamentos via Mercado Pago

## 🔐 Variáveis de Ambiente

### Web (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mercado Pago
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Mobile (.env)

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Mercado Pago
EXPO_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=
```

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev:web          # Roda Next.js web app
pnpm dev:app          # Roda Expo mobile app

# Build
pnpm build:web        # Build production do web
pnpm build:app        # Build production do app

# Qualidade de código
pnpm lint             # ESLint em todos os packages
pnpm typecheck        # TypeScript check em todos os packages

# Limpeza
pnpm clean            # Remove node_modules, .next, dist, etc.
```

## 🎯 Roadmap

- [x] Web app (Next.js)
- [x] Mobile app (React Native)
- [x] Shared library
- [x] Mercado Pago (PIX)
- [ ] Mercado Pago (Assinaturas com cartão)
- [ ] Notificações push
- [ ] Chat entre aluno e professor
- [ ] Feed social do CT

## 📝 Licença

UNLICENSED - Projeto privado do CT-Boxe.

## 👤 Autor

**Gabriel Felix**
[GitHub](https://github.com/gabrielfeelix)

---

**🥊 CT-Boxe — Equipe Argel Riboli**
