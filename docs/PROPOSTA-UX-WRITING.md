# Proposta de Revisão: UX Writing

**Objetivo:** Ajustar tom de voz para profissional mas acessível (não formal/corporativo, não muito casual).

---

## 📊 Resumo das Mudanças

- **Total de arquivos afetados:** ~15 arquivos
- **Total de alterações:** ~40 strings
- **Categorias:** Informal → Profissional | Jargão técnico → Claro | Contexto estranho → Apropriado

---

## 🔴 Categoria 1: Muito Informal → Profissional Acessível

### Feed (`src/app/(dashboard)/feed/page.tsx`)

| Antes (Informal) | Depois (Profissional) | Linha |
|---|---|---|
| "💣 Tem certeza que quer **detonar** esta publicação?" | "Tem certeza que deseja **excluir** esta publicação?" | 29 |
| "Publicação **aniquilada** com sucesso." | "Publicação **excluída** com sucesso." | 34 |
| "🚀 Postagem **Roteada** para o App!" | "Publicação **disponibilizada** no app" | 42 |
| "Postagem **Ocultada** do App📱" | "Publicação **removida** do app" | 42 |
| "Disparar Comunicado" | "Publicar Comunicado" | 64 |
| "Acorde a **galera**!" | "Compartilhe com seus alunos" | 73 |
| "**Kudos**" | "Curtidas" | 122 |

### Inadimplência (`src/app/(dashboard)/financeiro/inadimplencia/page.tsx`)

| Antes (Informal) | Depois (Profissional) | Linha |
|---|---|---|
| "**Malha Fina**" | "Pendências Financeiras" | 64 |
| "**Fala campeão**, \[nome\]!" | "Olá \[nome\]" | 23 |
| "**Operacionalizando Retenção**" | "Gerenciamento de Inadimplência" | 66 |
| "**Montante Congelado**" | "Total em Aberto" | 70 |
| "Cobrar **Zap**" | "Enviar WhatsApp" | 111 |

### Alunos (`src/app/(dashboard)/alunos/[id]/page.tsx`)

| Antes (Informal) | Depois (Profissional) | Linha |
|---|---|---|
| "Falar no **Zap**" | "Enviar WhatsApp" | 299 |

### Candidatos (`src/app/(dashboard)/candidatos/page.tsx` e `[id]`)

| Antes (Informal) | Depois (Profissional) | Linha |
|---|---|---|
| "Sem **tráfego orgânico**" | "Nenhuma inscrição recebida" | 105 |
| "a solicitação **pousará aqui**" | "a solicitação aparecerá aqui" | 106 |
| "Ninguém entra no CT sem o seu **crivo**" | "Ninguém entra no CT sem a sua aprovação" | 65 |
| "Ver **Dossiê** →" | "Ver Detalhes →" | 145 |
| "**Fala mestre**, \[nome\]!" | "Olá \[nome\]" | 104 (candidatos/[id]) |
| "Bater Papo (**Zap**)" | "Enviar WhatsApp" | 161 (candidatos/[id]) |
| "tracking do **zap**" | "anotações de contato" | 314 (candidatos/[id]) |
| "via **zap** que prefere" | "via WhatsApp que prefere" | 319 (candidatos/[id]) |

---

## ⚙️ Categoria 2: Jargão Técnico → Linguagem Clara

### Loading Labels (vários arquivos)

| Antes (Técnico) | Depois (Claro) | Arquivo |
|---|---|---|
| "**Compilando** histórico do caixa..." | "Carregando histórico..." | alunos/[id] L85 |
| "**Sincronizando** feed..." | "Carregando publicações..." | feed L57 |
| "**Sincronizando**..." | "Carregando..." | candidatos L39, contratos L40 |
| "**Varrendo banco relacional** do Supabase..." | "Buscando inadimplentes..." | inadimplencia L78 |
| "**Compilando** notas de fluxo..." | "Carregando dados..." | financeiro L53 |
| "**Compilando** relatórios..." | "Gerando relatórios..." | relatorios L88 |
| "**Varrendo storage** por mídias do cache..." | "Carregando stories..." | stories L71 |
| "**Compilando**..." | "Salvando..." | stories/novo L243 |

### Contratos (`src/app/(dashboard)/contratos/[id]/page.tsx`)

| Antes (Técnico) | Depois (Claro) | Linha |
|---|---|---|
| "**Disparar** Lembrete" | "Enviar Lembrete" | 206 |

---

## 📝 Outras Melhorias de Contexto

### Botões e Ações

| Antes | Depois | Contexto |
|---|---|---|
| "Renovar Pix" | "Gerar Nova Cobrança" | inadimplencia L121 (mais descritivo) |
| "Guardar" (ocultar post) | "Arquivar" | feed L137 (mais claro) |

---

## 🎯 Resumo por Sentimento

### Antes:
- Tom: "Dev falando com dev" + gírias do WhatsApp
- Exemplos: "detonar", "malha fina", "varrendo banco", "zap", "galera"
- Problema: **Muito técnico OU muito coloquial**, sem meio termo

### Depois:
- Tom: **Profissional mas acessível** (como um sistema SaaS moderno)
- Linguagem clara, direta, sem jargão técnico
- Mantém personalidade sem ser informal demais
- Exemplos: "excluir", "pendências financeiras", "buscando", "WhatsApp", "seus alunos"

---

## ✅ Validação Necessária

**Confirmar se as mudanças estão no tom correto:**
1. Removemos toda informalidade excessiva?
2. Tornamos termos técnicos mais acessíveis?
3. Mantivemos personalidade sem ser corporativo?

**Próximos passos:**
1. Aprovar proposta
2. Implementar mudanças em ~15 arquivos
3. Testar build
4. Commit

---

**Observação:** Arquivos afetados por mais de 3 mudanças:
- `feed/page.tsx` (7 mudanças)
- `inadimplencia/page.tsx` (6 mudanças)
- `candidatos/*` (8 mudanças total)
