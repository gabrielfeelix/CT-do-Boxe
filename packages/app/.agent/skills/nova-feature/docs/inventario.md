# Inventário do KITAMO — O que já existe

## Telas implementadas

### Autenticação
- Login, Register, Forgot Password, Verify Email (Breeze completo)
- Google OAuth: código pronto, aguardando credenciais

### Dashboard (Visão)
- Saldo atual somado de todas as contas
- Projeção de 30 dias via ProjecaoService
- Próximos vencimentos
- Widgets personalizáveis (HomeWidgetsManager.vue)
- Insights automáticos

### Contas
- CRUD completo: corrente, poupança, cartão de crédito, investimentos
- Fluxo multi-step de criação (CreateAccountFlowModal.vue)
- Visualização detalhada com histórico por conta

### Cartões de Crédito
- Gestão de múltiplos cartões
- Fatura mensal com período fechamento/vencimento
- Parcelamentos inteligentes
- Pagamento de fatura (debita conta corrente)

### Transações
- Modal de criação (TransactionModal.vue)
- Modal de detalhe (TransactionDetailModal.vue)
- Parcelamento automático (cria ParcelamentoGrupo + N transações)
- Recorrências (RecorrenciaGrupo)
- Transferências entre contas
- Tags e notas
- Multi-moeda BRL/USD/EUR

### Análise (Relatórios) — JÁ EXISTE
- Gastos por categoria (Analysis.vue)
- Comparação entre períodos (Analysis/Compare.vue)
- Export Excel via phpspreadsheet
- Export PDF via dompdf
- ExportReportModal.vue implementado

### Metas
- CRUD completo (Index, Create, Edit, Show)
- Depósitos incrementais (GoalDeposit)
- Progresso visual em %

### Configurações
- Categorias, Tags, Aparência, Notificações
- Backup/Restore JSON
- Segurança (ChangePasswordModal.vue)
- HomeWidgets

### Admin Panel
- Usuários, Roles, Logs, Planos, Notificações, Leads, News, Emails
- Sidebar vertical implementada

## O que NÃO existe ainda
- Google OAuth ativo (código pronto, sem credenciais)
- Notificações críticas (infraestrutura com 42 tipos, jobs não implementados)
- Importação de fatura (modal existe, backend não)
- Onboarding de primeiro acesso (projetado 3 steps, não implementado)
- PWA/Service Worker
