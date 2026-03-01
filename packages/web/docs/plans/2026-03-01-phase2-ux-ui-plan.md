# Fase 2 (Integração SaaS Web) UX/UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refinar severamente telas problemáticas de UX (Aulas, Timer, Notificações, Presença, Feed) para o Desktop Web, remover erros 500/404 de API e expurgar visualmente todo o "AI slop" que sobrou (emojis e gradientes de fundo).

**Architecture:** Modificaremos múltiplos componentes do `packages/web`, convertendo UX mobile-first em grids corporativos (Google Calendar para Aulas, Rule Engine toggles para Notificações). Todas as chamadas de API 500/404 serão isoladas via `console.log/debug`. Usaremos o ConfirmModal em Rescisão de Contrato. Emojis nativos viram ícones lucide.

**Tech Stack:** Next.js (App Router), `lucide-react`, TailwindCSS, Supabase Auth/DB

---

### Task 1: Limpeza Visual - Remoção de Emojis e Gradientes (KPIs e Avaliações)

**Files:**
- Modify: `packages/web/src/app/(dashboard)/avaliacoes/page.tsx`
- Modify: `packages/web/src/app/(dashboard)/financeiro/page.tsx` (se os KPIs problemáticos estiverem aqui ou nos componentes).
- Modify: Possíveis componentes KPI / Estatísticas na Home.

**Step 1: Write the failing test**
Não aplicável (UI Design).

**Step 2: Run test to verify it fails**
N/A.

**Step 3: Write minimal implementation**
- Substituir emojis inseridos hardcoded (😁👎) por renderizações do Lucide React nos cards das avaliações.
- Remover classes `bg-gradient-...` de Cards de KPI Financeiros/Dashboard, inserindo classes baseadas em `bg-white border-gray-200 shadow-sm`.
- Limpar as visões de "Aguardando avaliações".

**Step 4: Run test to verify it passes**
- Abrir tela e validar design brancos/cinzas e ícones adequados. Confirmar compilação `npm run build`.

**Step 5: Commit**
`git commit -m "refactor(web): remocao de emojis/gradientes e mudanca p/ padrao saas corporativo"`

---

### Task 2: Fix de APIs e Uso do ConfirmModal (Erros 500 PIX e Contrato)

**Files:**
- Modify: `packages/web/src/app/(dashboard)/contratos/[id]/page.tsx`
- Modify: `packages/web/src/app/api/pagamentos/route.ts`

**Step 1: Write the failing test**
Pular (API Backend Integrada via GUI).

**Step 2: Run test to verify it fails**
N/A

**Step 3: Write minimal implementation**
- Na tela de Detalhes de Contrato: substituir o `window.confirm` por nosso `<ConfirmModal variant="danger">` associado a state (`isOpen`, `onConfirm: rescindirContrato`).
- Na API Route de PIX (`pagamentos`): mapear o `try/catch`, envolver retorno 500 em log apropriado e verificar se a instanciação do Gateway falhava na importação de libs ou validação de id_aluno nulo/incompleto.

**Step 4: Run test to verify it passes**
Simular geração local do PIX/Rescisão sem crash visual 500.

**Step 5: Commit**
`git commit -m "fix(web): correcao api pix err 500 e adicao confirmModal p/ rescisao de contrato"`

---

### Task 3: Redesign do Timer (Presets e Modal Circular)

**Files:**
- Modify: `packages/web/src/app/(dashboard)/timer/page.tsx`

**Step 1: Write the failing test**
N/A.

**Step 2: Run test to verify it fails**
N/A.

**Step 3: Write minimal implementation**
- Remover blocos gigantes/gradient-y do componente atual.
- Criar Preset Cards fixos (`w-48 bg-white border shadow-sm`): "Boxe Profissional (12x3)", "Amador Olímpico (3x3)", "Aquecimento (5m)".
- Implementar o componente de Timer propriamente dito englobando-o em um modal ou seção ultra-clean quando clicado, inspirado num timer da Samsung/Google (Relógio digital grande circular com controle simples Play/Pause).

**Step 4: Run test to verify it passes**
`npm run build` na view e clique no timer sem quebra.

**Step 5: Commit**
`git commit -m "feat(web): redesign timer via modal e presets corporativos"`

---

### Task 4: Fluxo Tático do Gestor: Grade de Aulas (Week Calendar)

**Files:**
- Modify: `packages/web/src/app/(dashboard)/aulas/page.tsx`

**Step 1: Write the failing test**
N/A.

**Step 2: Run test to verify it fails**
N/A.

**Step 3: Write minimal implementation**
- Estruturar a página em Grade Semanal estilo Google Calendar (`grid-cols-7`). 
- As aulas ficarão mapeadas no dia da semana em pílulas (`div text-sm rounded-md bg-[#CC0000]/10 text-red-800`).
- Ao clicar numa aula na agenda, os "dados gerais" ou detalhes abrem dinamicamente, abandonando os zilhões de cards pesados.

**Step 4: Run test to verify it passes**
Visual check de flex/grid quebra no Desktop. `npm run build`.

**Step 5: Commit**
`git commit -m "feat(web): grade de aulas inspirada no google calendar e remocao de lista desorganizada"`

---

### Task 5: Diário de Classe - Presença

**Files:**
- Modify: `packages/web/src/app/(dashboard)/presenca/page.tsx`

**Step 1: Write the failing test**
N/A

**Step 2: Run test to verify it fails**
N/A

**Step 3: Write minimal implementation**
- O diário passa a ser linear: se escolhe a Aula no topo. Abaixo carrega-se Tabela Completa (`DataTable`) de alunos esperados para o horário.
- Ações inline com ícones de Switch ou Checkbox customizados limpos (Check verde = presente, X vermelho flat = Falta). 

**Step 4: Run test to verify it passes**
Build test + verificação de clareza visual (zero cards enormes para presença).

**Step 5: Commit**
`git commit -m "feat(web): usabilidade do diario de classe modernizada tabular"`

---

### Task 6: Novo Feedback Social (Feed c/ Imagens) e Notificações Custom 

**Files:**
- Modify: `packages/web/src/app/(dashboard)/feed/page.tsx`
- Modify: `packages/web/src/app/(dashboard)/notificacoes/page.tsx`

**Step 1: Write the failing test**
N/A

**Step 2: Run test to verify it fails**
N/A

**Step 3: Write minimal implementation**
- **Feed:** Inserir input customizado para imagem local (`use dropzone` ou `input file hidden`). Desenhar postes (Timeline) em formato quadrado e flat, simulando Fb Web.
- **Notificações:** Em vez de envio "avulso", desenhar um "Painel de Regras do App" em `notificacoes/page.tsx` contendo toggles (Chaves liga/desliga): "Vencimento de Fatura", "Atraso no Boleto", "Novidade Nova Aula", "Alerta Rede Social YouTube/IG" usando Forms. 

**Step 4: Run test to verify it passes**
Validar as UIs. `npm run build`.

**Step 5: Commit**
`git commit -m "feat(web): usabilidade fb-like no feed corporativo e painel de regras de notificacoes em settings"`
