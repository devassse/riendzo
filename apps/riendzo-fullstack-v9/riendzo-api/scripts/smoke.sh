#!/usr/bin/env bash
# Teste rápido com a API a correr:  npm run smoke   (ou: bash scripts/smoke.sh http://localhost:4000)
# Usa ADMIN_USERNAME / ADMIN_PASSWORD do ambiente (por defeito admin / riendzo-admin).
set -u
API="${1:-http://localhost:4000}/api/v1"
USER="${ADMIN_USERNAME:-admin}"
PASS="${ADMIN_PASSWORD:-riendzo-admin}"
fail=0

check() { # descrição, código esperado, código obtido
  if [ "$2" = "$3" ]; then echo "  ok   $1 ($3)"; else echo "  FALHOU $1: esperado $2, obteve $3"; fail=1; fi
}
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

echo "Riendzo API: $API"
check "health"                       200 "$(code "${API%/api/v1}/health")"
check "menus"                        200 "$(code "$API/collections")"
check "praias publicadas"            200 "$(code "$API/collections/tourism-beaches/items")"
check "pesquisa"                     200 "$(code "$API/search?q=praia")"
check "tempo (Maputo)"               200 "$(code "$API/weather")"
check "menu inexistente"             404 "$(code "$API/collections/nao-existe/items")"
check "admin sem sessão"             401 "$(code "$API/admin/collections/tourism-beaches/items")"

TOKEN=$(curl -s -X POST "$API/admin/auth/login" -H 'Content-Type: application/json' \
  -d "{\"username\":\"$USER\",\"password\":\"$PASS\"}" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
if [ -z "$TOKEN" ]; then echo "  FALHOU login de administrador"; exit 1; fi
echo "  ok   login de administrador"
AUTH=(-H "Authorization: Bearer $TOKEN")

check "admin lista (com rascunhos)"  200 "$(code "${AUTH[@]}" "$API/admin/collections/tourism-beaches/items")"
check "criar conteúdo (rascunho)"    201 "$(code "${AUTH[@]}" -X POST "$API/admin/collections/blog-news/items" -H 'Content-Type: application/json' \
  -d '{"slug":"teste-smoke","title":"Teste smoke","tag":"Teste","categories":[],"color":"#0054b5","emoji":"🧪","summary":"Criado pelo smoke test.","status":"draft"}')"
check "rascunho não é público"       404 "$(code "$API/collections/blog-news/items/teste-smoke")"
check "publicar"                     200 "$(code "${AUTH[@]}" -X POST "$API/admin/collections/blog-news/items/teste-smoke/status" -H 'Content-Type: application/json' -d '{"status":"published"}')"
check "agora é público"              200 "$(code "$API/collections/blog-news/items/teste-smoke")"
check "eliminar"                     204 "$(code "${AUTH[@]}" -X DELETE "$API/admin/collections/blog-news/items/teste-smoke")"

[ "$fail" = 0 ] && echo "Tudo OK." || { echo "Há falhas."; exit 1; }
