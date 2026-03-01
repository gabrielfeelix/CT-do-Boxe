---
description: Deploy completo do KITAMO para produção no Hostinger.
---
// turbo-all
1. Verificar git status (sem arquivos pendentes)
2. Fazer commit e push para main
3. GitHub Actions executa o deploy automaticamente (.github/workflows/deploy.yml)
4. Checar kitamo.com.br após 2 minutos
5. Se falhou, verificar Actions log no GitHub e storage/logs/laravel.log no servidor
