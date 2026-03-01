---
name: deploy
description: Use quando o usuário pedir para fazer deploy, subir para
produção, publicar no servidor ou executar o script de hospedagem.
---

# Skill: Deploy KITAMO

## Consulte
Leia `docs/hostinger.md` para detalhes do servidor.

## Deploy principal (GitHub Actions)

O deploy e automatizado: cada push para `main` triggera `.github/workflows/deploy.yml`.
Nao precisa rodar nada manualmente — basta fazer push.

## Deploy manual (SSH script)

Se precisar deployar sem GitHub Actions:

1. Verificar que nao ha mudancas nao commitadas
2. Rodar `scripts/hostinger-deploy-ssh.sh`
3. Verificar logs de erro apos deploy
4. Confirmar que kitamo.com.br esta respondendo

## Atencao

- Nunca subir com .env de desenvolvimento
- Preservar storage/ e .env no servidor
- PHP no servidor: sempre usar `/opt/alt/php83/usr/bin/php` (NAO usar `php` que e 7.2)
- O `.htaccess` na raiz do repo redireciona requests para `public/` — NUNCA remover
- Se extensoes PHP pararem de funcionar (PDO not found, etc), contatar suporte Hostinger sobre CageFS
