# Infraestrutura Hostinger

## Servidor
- **Tipo**: Shared Hosting (CloudLinux + CageFS)
- **Web Server**: LiteSpeed
- **PHP**: 8.3 via alt-php83 (`/opt/alt/php83/usr/bin/php`)
- **Database**: MySQL (Hostinger interno)
- **IP**: 147.79.84.203
- **SSH Port**: 65002
- **User**: u626119115

## IMPORTANTE: PHP no servidor

O `php` no PATH do SSH e PHP 7.2 (sistema). Sempre usar o binario completo:

```bash
/opt/alt/php83/usr/bin/php artisan migrate --force
/opt/alt/php83/usr/bin/php artisan optimize:clear
```

## Estrutura de Diretorios

```
~/domains/kitamo.com.br/public_html/   <- document root (Hostinger)
├── .htaccess          <- redireciona para public/ (CRITICO, vem do repo)
├── app/
├── bootstrap/
├── config/
├── database/
├── public/            <- webroot real do Laravel
│   ├── index.php      <- entry point
│   ├── .htaccess      <- htaccess padrao do Laravel
│   ├── build/         <- assets compilados pelo Vite
│   └── storage -> ../storage/app/public (symlink)
├── resources/
├── routes/
├── storage/           <- persistente (logs, uploads, cache)
├── vendor/
└── .env               <- persistente (configuracoes de producao)
```

## Deploy

### Automatizado (GitHub Actions) — METODO PRINCIPAL

Cada push para `main` triggera `.github/workflows/deploy.yml`:
1. `composer install` + `npm ci` + `npm run build`
2. `rsync` direto para o servidor (sem zip, sem git pull)
3. Verifica assets, fixa permissoes, cria symlink storage
4. Roda migrations + cache com `/opt/alt/php83/usr/bin/php`

### Manual (SSH script) — backup

```bash
scripts/hostinger-deploy-ssh.sh
```
Requer `.hostinger.deploy.env` configurado.

## CloudLinux / CageFS

O servidor usa CloudLinux com CageFS (filesystem isolado por usuario).
Extensoes PHP (PDO, mbstring, etc) sao carregadas via `/opt/alt/php83/link/conf/`.

Se extensoes pararem de funcionar:
1. Criar `phpinfo.php` em `public/` e verificar "Additional .ini files parsed"
2. Se estiver vazio, contatar suporte Hostinger pedindo:
   - `cagefsctl --rebuild-alt-php-ini`
   - `cagefsctl --force-update`
3. Apenas root (Hostinger) pode rodar esses comandos

## Seguranca

- `.env` e `storage/` sao preservados no deploy (excluidos do rsync)
- Nao commitar `.hostinger.deploy.env`
- Nao expor credenciais SSH em chat/historico
- Se credenciais vazaram, rotacione chave SSH no painel da Hostinger
