# Riendzo API

API do Riendzo em **Node.js + Express + Prisma + PostgreSQL** (TypeScript).
Serve o conteúdo do site (225 conteúdos iniciais em 36 menus), o BackOffice, os membros do Riendzo AI,
as mensagens de contacto, o carregamento de ficheiros e o **tempo em Maputo** (card do hero e barra do topo).

## Arrancar (5 minutos)

Requisitos: Node 20+ e Docker (ou um PostgreSQL 14+ à parte).

```bash
cd riendzo-api
docker compose up -d db          # PostgreSQL em localhost:5432
cp .env.example .env             # DATABASE_URL já aponta para o docker compose
npm install                      # instala e gera o Prisma Client
npm run setup                    # migrations (estrutura + dados básicos) + conteúdo inicial
npm run dev                      # http://localhost:4000
npm run smoke                    # (noutro terminal) testa a API de ponta a ponta
```

`npm run setup` = `prisma migrate deploy` + `prisma db seed`:

| Passo | O que faz |
|---|---|
| migration `…_init` | cria as tabelas |
| migration `…_base_data` | **dados básicos**: 7 grupos de menu, 35 menus, 17 listas (províncias, estilos musicais, tipos de alojamento…) |
| migration `…_creators_directory` | os Criadores de Conteúdo passam a ter página própria |
| migration `…_territories` | divisão administrativa: distritos, municípios, postos, localidades e bairros |
| migration `…_member_travel_styles` | os membros podem ter vários estilos de viagem |
| migration `…_profiles_home_notifications` | contactos e foto dos utilizadores, definições (Home, cores da Cronologia), recuperação de palavra-passe, endereço nas notificações e o menu **Frutos do Mar** |
| `prisma db seed` | 225 conteúdos iniciais (praias, receitas, artistas, bancos, história…) e as listas de etiquetas/categorias |

O seed é seguro de repetir: só acrescenta o que falta e **nunca altera** o que já foi editado.

Tudo em Docker (base de dados + API): defina `JWT_SECRET` e `ADMIN_PASSWORD` no `.env` e corra
`docker compose up -d --build`; depois `docker compose run --rm api npx prisma db seed`.

## Ligar o frontend

No `riendzo-webapp/.env.local`:

```env
RIENDZO_API_URL=http://localhost:4000
RIENDZO_API_KEY=<o mesmo valor de SERVICE_API_KEY do .env da API>
```

Gere a chave com `openssl rand -base64 36` e ponha-a nos dois lados. Reinicie `npm run dev` no frontend.

- **Com `RIENDZO_API_URL` definida**: todo o conteúdo (leitura e BackOffice: criar, editar, duplicar, ocultar,
  reordenar, eliminar) passa pela API/PostgreSQL (`lib/cms/store.ts` → `lib/cms/store-api.ts`).
- **Sem ela**: o frontend continua a usar os ficheiros em `data/`, como antes.
- O **tempo** (`/api/weather` do Next) usa a API quando configurada e, senão, o Open-Meteo diretamente.

Ainda em ficheiros no frontend (a API já tem os endpoints; falta só trocar em cada `lib/…`):
listas, "Em breve" dos menus, mensagens, atividade, utilizadores, membros, media, Home, cores da Cronologia e recuperação de palavra-passe.
Para o e-mail de recuperação defina `RESEND_API_KEY` e `MAIL_FROM` (frontend e/ou API).

## Autenticação

| Quem | Como | Token |
|---|---|---|
| BackOffice | `POST /api/v1/admin/auth/login` `{username,password}` (conta do `.env` ou utilizador criado no BackOffice) | JWT 8 h, `Authorization: Bearer …` |
| Servidor do Next.js | cabeçalho `x-api-key: <SERVICE_API_KEY>` (opcional `x-acting-user`) | — |
| Membros | `POST /api/v1/members/register` / `login` | JWT 30 dias |

Perfis: `admin` (tudo), `editor` (conteúdo, sem utilizadores/listas/menus/mensagens/membros) e
`owner` (só edita os estabelecimentos associados à conta; não altera o endereço nem o destaque pago).
As palavras-passe do BackOffice são alfanuméricas (letras e números, mín. 8). Usam scrypt (mesmo formato do frontend, por isso são compatíveis).

## Endpoints

Base: `/api/v1`. Respostas: `{ "data": … }` (listas também `meta`); erros: `{ "error": { "code", "message", "details?" } }`.

**Públicos**

| Método | Rota | Descrição |
|---|---|---|
| GET | `/groups` | grupos do menu com os seus menus |
| GET | `/collections` · `/collections/:id` | menus (com nº de publicados) · um menu + opções de etiquetas/categorias |
| GET | `/collections/:id/items?q=&category=&tag=&limit=&offset=` | conteúdo publicado (patrocinados primeiro) |
| GET | `/collections/:id/items/:slug` | um conteúdo publicado |
| GET | `/collections/:id/options` · `/lists` · `/lists/:id` | listas genéricas |
| GET | `/search?q=&collection=&limit=` | pesquisa em todo o site (ignora acentos) |
| GET | `/menus/flags` | marcas "Em breve" |
| GET | `/home` · `/history/theme` | Home (6 experiências + entradas com “Mostrar na Home”) · cores da Cronologia |
| GET | `/territories` | distritos, municípios, bairros… (mapa de Moçambique) |
| GET | `/notifications` | registos novos (sino do portal de utilizador) |
| GET | `/weather?lat=&lon=&name=` | tempo atual (por defeito Maputo), cache de 10 min |
| POST | `/contact` | formulário de contacto (5 por 10 min por IP) |
| POST | `/members/register` · `/members/login` | conta de membro |
| POST | `/members/forgot` · `/members/reset` | recuperar palavra-passe por e-mail (link válido 1 h) |
| GET/PATCH | `/members/me` | perfil (Bearer) |
| POST | `/members/me/password` | mudar palavra-passe |
| GET/POST | `/members/me/favorites` · `/members/me/favorites/toggle` | favoritos |

**BackOffice** (`/admin/…`)

| Método | Rota | Perfil |
|---|---|---|
| POST | `/auth/login` · GET/PATCH `/auth/me` (perfil, foto) | — |
| POST | `/auth/forgot` · `/auth/reset` | — (recuperar palavra-passe) |
| POST/PUT/DELETE | `/territories` · `/territories/:id` | admin, editor |
| GET/PUT | `/home` · `/history-theme` · GET `/notifications` | admin, editor |
| GET | `/stats` · `/recent` · `/search` · `/activity` | admin, editor |
| GET | `/collections/:id/items` · `/:slug` (com rascunhos) | todos (owner só os seus) |
| POST | `/collections/:id/items` | admin, editor |
| PUT | `/collections/:id/items/:slug` | admin, editor, owner (os seus) |
| DELETE / POST | `…/:slug` · `…/:slug/status` · `/featured-week` · `/move` · `/duplicate` | admin, editor |
| PUT | `/lists/:id` · `/menus/flags` | admin |
| GET/POST/PUT/DELETE | `/users` · GET `/members` · POST `/members/:id/status` · GET/POST/DELETE `/inbox` | admin |
| GET/POST/DELETE | `/media` (multipart, campo `file`) | staff (apagar: admin, editor) |

Ficheiros: `GET /api/media/<ano>/<ficheiro>` (também `/media/…`). O tipo real é validado pelos primeiros bytes
(JPG, PNG, WebP, GIF, AVIF, MP3, M4A, OGG, WAV); imagens até 5 MB.

## Modelo de dados

`prisma/schema.prisma`. O conteúdo (`items`) tem colunas para filtrar/ordenar/pesquisar (`collection_id`, `slug`,
`title`, `tag`, `categories`, `status`, `featured`, `position`, `search_text`) e o resto no JSONB `data`, no
**mesmo formato** que o frontend já usa (`CatalogItem`, `Recipe`, `Artist`) — por isso as páginas não mudam.
O HTML do editor (`body`) é sanitizado no servidor. Novos menus: acrescente-os numa migration
(`npx prisma migrate dev --create-only --name novo_menu`) e em `lib/cms/collections.ts` no frontend.

## Segurança

Helmet, CORS restrito a `CORS_ORIGINS`, limite de pedidos (300/min; login 5 falhas/15 min), validação com Zod,
JWT assinado (HS256), comparação em tempo constante, hashes scrypt, uploads validados pelo conteúdo.
**Em produção** defina `JWT_SECRET`, `ADMIN_PASSWORD` e `SERVICE_API_KEY` fortes, `NODE_ENV=production`,
use HTTPS e, atrás de proxy, `TRUST_PROXY=1`.

## Scripts

`dev` · `build` · `start` · `typecheck` · `db:migrate` (desenvolvimento) · `db:deploy` · `db:seed` · `db:studio` ·
`db:reset` · `setup` · `smoke`.
