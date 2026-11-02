# Riendzo BackOffice

Portal do Administrador em **`/admin`** (fora do routing de idiomas).

## Primeiros passos
1. `cp .env.example .env.local` e defina `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` (32+ caracteres: `openssl rand -base64 48`).
2. `npm run dev` e abra http://localhost:3000/admin.
   Em desenvolvimento, sem variáveis, entra com `admin` / `riendzo-admin`. Em produção o acesso fica bloqueado até configurar as variáveis.

## Aspeto
Layout de portal (barra lateral com os menus do Riendzo, cabeçalho com pesquisa Ctrl + K, banner de boas-vindas, números, acesso rápido, conteúdos recentes e novidades) nas cores do Riendzo (`#0054b5`, `#0370d6`, `#01adfb`). Logos em `public/brand/` (versões transparentes, a cores e a branco).

## O que tem
- **Dashboard**: totais, publicados/rascunhos, conteúdos sem fotografia, estado por menu e atividade recente.
- **18 menus de conteúdo** (Turismo, Serviços Públicos, Entretenimento, Blog e Gastronomia → Receitas e Bebidas): criar, editar, duplicar, publicar/ocultar (rascunho), reordenar e eliminar.
- **Biblioteca de media**: carregar/eliminar imagens (validação por conteúdo real do ficheiro, máx. 5 MB).
- O site público lê o conteúdo daqui e esconde os rascunhos. Cada alteração atualiza o site (`revalidatePath`).

## Onde ficam os dados
| Caminho | Conteúdo |
|---|---|
| `data/cms/<menu>.json` | conteúdo de cada menu (a ordem do ficheiro é a ordem no site) |
| `data/cms/_activity.json` | últimas 100 ações |
| `data/uploads/<ano>/` | imagens (servidas em `/api/media/...`) |

Na primeira leitura cada menu é preenchido com o conteúdo inicial de `lib/cms/seeds.ts`.
**Faça backup da pasta `data/`** (está no `.gitignore`). Precisa de disco persistente (VPS/Docker com volume). Em hosting *serverless* (ex.: Vercel) troque `readJson`/`writeJson` em `lib/cms/store.ts` por base de dados/armazenamento de objetos: é o único ficheiro que toca no disco.

## Segurança
Cookie de sessão assinado (HMAC), `httpOnly`, 8 h; comparação em tempo constante; bloqueio de 15 min após 5 falhas por IP (em memória); todas as ações de servidor verificam a sessão; validação de todos os campos no servidor; links só `http(s)`/relativos; upload com verificação de origem e de tipo real. Use sempre HTTPS em produção.

## Acrescentar um menu
1. Defina-o em `lib/cms/collections.ts` e o conteúdo inicial em `lib/cms/seeds.ts`.
2. Na página pública, leia com `getPublishedItems("<id>")`.
