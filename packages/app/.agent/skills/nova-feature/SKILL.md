---
name: nova-feature
description: Use quando o usuário pedir para implementar, criar ou adicionar
uma nova funcionalidade, tela, componente, endpoint ou fluxo no KITAMO.
---

# Skill: Nova Feature KITAMO

## Antes de qualquer coisa
Leia o arquivo `docs/inventario.md` nesta pasta.
Verifique se o que está sendo pedido já existe.
Se já existe, informe e pergunte se quer melhorar o existente.

## Padrão de implementação

### Backend (Laravel)
1. Migration nova (nunca modificar existente)
2. Model com relacionamentos Eloquent
3. Controller com métodos: index, store, show, update, destroy
4. Form Requests para validação
5. Registrar rota em routes/web.php seguindo padrão existente

### Frontend (Vue + Inertia)
1. Componente em resources/js/Components/ se reutilizável
2. Página em resources/js/Pages/ se é uma view completa
3. TypeScript types obrigatórios
4. Seguir design system do rules (cores, border-radius, sombras)
5. Mobile-first, touch targets mínimo 44x44px
6. Estado vazio sempre com: ícone + texto explicativo + CTA

### Padrões de UI obrigatórios
- Modal para formulários curtos (adicionar transação)
- Drawer para detalhes/edição de item
- FAB teal para ação primária da tela
- Toasts de feedback: sucesso verde, erro vermelho, bottom center
- Confirmar sempre antes de ações destrutivas (modal com botão vermelho)
