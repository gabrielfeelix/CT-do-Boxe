# Phase 2: Refinamento UX/UI e Integrações Desktop (SaaS)

## Visão Geral
Esta fase ataca pontos críticos de usabilidade que permaneceram com "aspectos não-profissionais" da versão anterior. O foco é remover elementos poluídos (emojis, gradientes pesados, cards super-dimensionados) e ajustar as interfaces que afetam a linearidade e eficiência do professor do CT. Também abordaremos fluxos complexos e regras de notificação para engajar alunos.

## Especificação de Design e Arquitetura

### 1. Timer Clean & Samsung-like App
- **Anterior:** Timer full-screen com design primitivo e exagerado, com dezenas de botões poluídos e uso de "bg-gradient".
- **Novo Design:** 
  - Cards de "Timers Frequentes / Presets" (ex: "Combate 5 min", "Sparring Técnico 3 min", "Tabata").
  - Ao clicar, abrir um Modal Centralizado (minimalista, em forma de anel/círculo) com a contagem nítida e pausa limpa.

### 2. Aulas & Presenças (Linearidade UI)
- **Anterior:** Inúmeros cards laterais com dados genéricos sobrepostos, sem lógica sequencial.
- **Novo Design (Aulas):** Uma "Grade Semanal" (Weekly Calendar) estilo Google Calendar/Outlook, onde as aulas aparecem bloqueadas, limpas, destacando a turma do lado direito.
- **Novo Design (Presença):** "Diário de Classe Digital" - Formato de **Tabela Limpa**, listando os alunos matriculados naquela série, com _checkboxes_ rápidos para "Presente / Falta", sem recarregar a tela desnecessariamente.

### 3. Ficha do Candidato "Inline Editing"
- **Anterior:** Design bloqueado, e observações numa caixa isolada.
- **Novo Design:** Formulário rico "Inline Editing". O professor clica e altera rapidamente nível e disponibilidade ali mesmo.

### 4. Gestão de Feed e Notificações (Rules Engine)
- **Feed:** Inclusão de suporte visual a Imagens (`use supabse storage images`), interface reformulada inspirada no Facebook/Twitter corporativo e sistema de menções/hashtags para eventos do CT.
- **Notificações:** Painel Toggles Corporativo de **"Gatilhos de Notificação Automáticos do Sistema"**. 
    - Gatilhos: Novo vídeo no IG/YouTube, Vencimento de Contrato, Vencimento de Fatura, Aula de Graduação próxima.
    - Status de Liga/Desliga, para que o Gateway dispare Firebase Pushs aos alunos com base no evento.

### 5. Correção de Bugs de UX e API
- **Problemas mapeados:** 404 Aprovação de candidato, 400 Avaliação, Emojis genéricos, Erro 500 PIX, e o `window.confirm()` em Rescisão de Contrato.
- **Solução (Ação):**
  - Remover Emojis e substituir por `Lucide React`.
  - Revisão rigorosa de `route.ts`.
  - Adoção sistemática do novo `<ConfirmModal>` para a quebra de contrato e demais ações perigosas.

## Critérios de Sucesso
- Zero Emojis em sistema. Zero Gradientes em KPIs (Uso de cartões Brancos flat com métricas precisas).
- Integração da API limpa (sem 500).
- Experiência do usuário (UX) coesa, rápida e linear, especialmente focada no Desktop.
