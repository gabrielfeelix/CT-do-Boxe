---
name: frontend-design
description: Use esta skill SEMPRE que o usuário pedir para criar, refatorar ou revisar telas, componentes (.vue), CSS (Tailwind) ou qualquer coisa relacionada ao frontend do KITAMO. Impede a geração de "AI slop" genérico.
---

# Skill: Frontend Design Premium & Anti-Slop (KITAMO)

**Gatilho Automático:** Aplicar incondicionalmente ao mexer em arquivos `.vue`, `.css`, `tailwind.config.js` ou quando o usuário citar "tela", "UI", "componente", "site".

Esta skill define as regras inegociáveis para a criação de interfaces de nível de produção no Kitamo. O objetivo principal é fugir de estéticas genéricas ("AI slop") e entregar designs ousados, refinados e memoráveis.

## 1. Design Thinking: O Que Fazer Antes de Codar

Antes de escrever qualquer código, comprometa-se com uma direção estética CLARA e INCISIVA.
- **Diferenciação:** O que torna esta interface inesquecível?
- **Tom:** Como no KITAMO a regra é "clareza, mobile-first e tom amigável" (ver `design-system`), alinhe a estética a isso, mas de forma premium. Pode flertar com minimalismo limpo ou layouts modernos dinâmicos (overlays, blur, etc).
- **CRÍTICO:** Nunca escolha "ficar no meio termo". O design genérico de IA morre na falta de intencionalidade.

## 2. Regras de Engajamento (Frontend Aesthetics Guidelines)

Implemente o código `Vue.js + TailwindCSS` utilizando obrigatoriamente estes pilares:

### Tipografia Magnética
- **JAMAIS** dependa apenas de Arial, Arial, ou Roboto sem intencionalidade.
- Escolha fontes expressivas e configure-as corretamente no Tailwind. Combine uma tipografia "display" impactante com uma "body" refinada e extremamente legível. 

### Cores, Atmosfera e Profundidade
- Cores dominantes com sotaques (accents) nítidos são preferíveis a paletas tímidas. Consulte o `docs/tokens.md`.
- **NUNCA use "AI Slop" comum:** Gradientes roxos/rosas em fundos brancos sem sentido contextual.
- No lugar de fundos chapados e enfadonhos (solid colors), use malhas de gradiente sutis (`bg-gradient-to-r`), texturas de ruído overlay, blur (`backdrop-blur`), ou sombras dramáticas bem calculadas.

### Motion e Micro-interações
- Cada clique e cada _scroll_ deve gerar "delight".
- Em componentes Vue, utilize o evento montado (`IntersectionObserver` ou `MotionSection` já existente) para _Staggered Reveals_.
- Use diretivas de Tailwind (`transition-all duration-300 ease-in-out hover:scale-105`, etc.) em botões e cards de forma intencional e sem exageros baratos. O movimento deve parecer "premium" (curvas cubic-bezier).

### Composição Espacial 
- Fuja do grid padrão "card centralizado atrás de card centralizado".
- Ouse com assimetria, espaços negativos generosos, caixas "saindo" dos grids, e larguras que quebram a monotonia (`w-[110%] -ml-[5%]`, sobreposições absolutas, etc.).

## 3. Integração KITAMO

Sempre que a skill for ativada no projeto Kitamo:
1. Leia o "design-system" existente (cores da marca, brand voice).
2. Escreva marcação semântica em Vue com classes do TailwindCSS.
3. Não crie designs "vazios". Use dados plausíveis e mostre estados de erro/vazio bem trabalhados.

**Lembre-se:** A IA é capaz de trabalhos extraordinários. Não entregue apenas um MVP sem graça. Execute sua visão com perfeição técnica e traga a sensação de uma aplicação luxuosa e impecável.
