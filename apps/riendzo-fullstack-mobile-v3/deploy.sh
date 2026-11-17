#!/usr/bin/env bash
# Riendzo — deploy com Docker Compose (db + api + web + caddy)
#   ./deploy.sh            build + arranque
#   ./deploy.sh secrets    gera valores aleatórios para as chaves do .env
#   ./deploy.sh seed       1ª vez: carrega o conteúdo inicial na base de dados
#   ./deploy.sh logs [svc] ver os registos (ex.: ./deploy.sh logs api)
#   ./deploy.sh status     estado dos serviços
#   ./deploy.sh backup     cópia da base de dados + ficheiros em ./backups
#   ./deploy.sh import-data  copia riendzo-webapp/data (conteúdo e ficheiros do PC) para o servidor
#   ./deploy.sh down       para tudo (os dados ficam guardados)
set -euo pipefail
cd "$(dirname "$0")"

need_env() {
  [ -f .env ] || { echo "Falta o ficheiro .env  →  cp .env.example .env  e preencha-o."; exit 1; }
}
dc() { docker compose "$@"; }

case "${1:-up}" in
  secrets)
    gen() { openssl rand -base64 48 | tr -d '\n=+/' | cut -c1-48; }
    for k in POSTGRES_PASSWORD JWT_SECRET SERVICE_API_KEY ADMIN_SESSION_SECRET SETTINGS_SECRET ADMIN_PASSWORD; do echo "$k=$(gen)"; done
    echo; echo "Copie estas linhas para o .env (guarde a ADMIN_PASSWORD num sítio seguro)."
    ;;
  up)
    need_env
    dc up -d --build
    echo; dc ps
    echo; echo "Pronto. 1ª vez? Corra:  ./deploy.sh seed"
    ;;
  seed)
    need_env
    dc exec api npx prisma db seed
    ;;
  logs)
    shift; dc logs -f --tail=100 "$@"
    ;;
  status)
    dc ps
    ;;
  backup)
    need_env
    set -a; . ./.env; set +a
    stamp="$(date +%Y%m%d-%H%M%S)"; mkdir -p backups
    dc exec -T db pg_dump -U "${POSTGRES_USER:-riendzo}" "${POSTGRES_DB:-riendzo}" | gzip > "backups/db-$stamp.sql.gz"
    dc exec -T web tar -C /app/data -czf - . > "backups/web-data-$stamp.tar.gz"
    dc exec -T api tar -C /app/uploads -czf - . > "backups/api-uploads-$stamp.tar.gz"
    echo "Cópias em ./backups ($stamp)"
    ;;
  import-data)
    need_env
    [ -d riendzo-webapp/data ] || { echo "Não existe riendzo-webapp/data"; exit 1; }
    dc cp riendzo-webapp/data/. web:/app/data
    dc exec -u root web chown -R node:node /app/data
    echo "Dados copiados."
    ;;
  down)
    dc down
    ;;
  *)
    sed -n 2,11p "$0"; exit 1
    ;;
esac
