---
description: Criar uma nova feature completa (Backend + Frontend + Design)
---

# Workflow: Nova Feature Completa

Este workflow orquestra 3 departamentos para criar uma feature do zero.

## Passo 1: Planejamento (Regras de Negócio)
**Skill**: `regras-negocio`

- Defina a lógica de negócio da feature
- Identifique entidades, relacionamentos e regras
- Documente casos de uso

**Entregável**: Documento de especificação ou comentário aprovado

---

## Passo 2: Backend (Dev)
**Skill**: `nova-feature`

// turbo
1. Crie a migration:
```bash
php artisan make:migration create_[nome]_table
```

2. Crie o Model e Controller:
```bash
php artisan make:model [Nome] -c
```

3. Defina as rotas em `routes/web.php`

4. Rode a migration:
```bash
php artisan migrate
```

**Entregável**: API funcional testável via Postman/Insomnia

---

## Passo 3: Frontend (Dev + Design)
**Skills**: `nova-feature` + `design-system`

1. Crie o componente Vue em `resources/js/Pages/[Nome].vue`
2. Use TypeScript para props e interfaces
3. Aplique o Design System (cores, espaçamentos)
4. Garanta responsividade mobile-first

**Entregável**: Tela funcional acessível via navegador

---

## Passo 4: Testes e Validação (QA)
// turbo
1. Rode o build:
```bash
npm run build
```

2. Teste a aplicação localmente:
```bash
php artisan serve
```

3. Verifique:
   - [ ] Funcionalidade completa
   - [ ] Responsividade
   - [ ] Sem erros no console

---

## Passo 5: Deploy (DevOps)
**Skill**: `deploy`

Siga o workflow de deploy padrão (ver `.agent/skills/deploy/SKILL.md`)

---

## Como usar este workflow
Digite: `/nova-feature-completa` e eu vou executar todos os passos automaticamente.
