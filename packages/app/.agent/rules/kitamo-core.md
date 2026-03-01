# KITAMO — Regras Permanentes do Agente

## Identidade do Produto
- Nome: KITAMO
- Proposta: Responder "Vai dar dinheiro até o fim do mês?"
- Foco: Input manual confiável + projeção futura
- NÃO promete Open Finance, automação bancária ou sincronização

## Stack Técnico
- Backend: Laravel 12 + PHP 8.3
- Frontend: Vue 3.4 + TypeScript 5.6 + Inertia.js
- CSS: Tailwind CSS 3.2.1
- Database DEV: SQLite | PROD: MySQL via Hostinger
- Build: Vite 7.0.7
- Deploy: Hostinger via GitHub Actions (rsync) — ver `.github/workflows/deploy.yml`
- PHP no servidor: `/opt/alt/php83/usr/bin/php` (NAO usar `php` que e 7.2)

## Convenções Obrigatórias
- TypeScript types obrigatórios em todo frontend
- Migrations são imutáveis — sempre criar novas, nunca modificar
- Mobile-first em todos os componentes Vue
- npm install sempre com --legacy-peer-deps
- Session e Cache: driver file (nunca database em shared hosting)
- Nunca commitar /public/build

## Design System
- Cor primária (marca/CTAs/FAB): #14B8A6 (teal)
- Cor receitas/positivo: #10B981 (verde)
- Cor despesas/negativo: #EF4444 (vermelho)
- Cor avisos: #F59E0B (amarelo)
- Tipografia: system font, hierarquia 48/30/24/16/14/12px
- Cards: border-radius 12px, sombra leve
- FAB: teal, fixo canto inferior direito
- Nunca inventar cores fora desse sistema

## Regra Crítica Antes de Qualquer Feature
Antes de propor ou construir qualquer tela, componente ou funcionalidade,
consulte o arquivo `.agent/skills/nova-feature/docs/inventario.md`
para verificar se já existe implementado no sistema.

## O que Nunca Fazer
- Não sugerir Open Finance, screen scraping ou automação bancária
- Não tratar investimentos como despesas
- Não usar localStorage com sessões
- Não hardcodar credenciais
- Não quebrar o padrão mobile-first
- Não usar cores fora do design system
