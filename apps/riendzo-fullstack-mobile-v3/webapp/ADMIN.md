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

## Locais sugeridos pelos membros

Os membros registados guardam locais no seu perfil (**Os meus locais**) e podem sugeri-los à equipa.

1. **BackOffice → Locais sugeridos** (com contador de pendentes). Separadores: *Por rever*, *Aprovados*, *Não aprovados*.
2. **Rever**: escolha o menu onde publicar, ajuste título, categorias, resumo, descrição, contactos e fotografias.
3. **Aprovar e publicar** cria o conteúdo já publicado e avisa o membro por e-mail. Depois pode abrir o conteúdo no editor completo (horários, galeria…).
4. **Não aprovar** pede um motivo, que o membro vê; ele pode corrigir e sugerir outra vez.

As notas privadas do membro nunca chegam à equipa. Os dados ficam em `data/members/places.json`.

## Verificação de conta

Depois de se registar, o membro tem de confirmar um código de 6 dígitos (e-mail ou SMS). Sem confirmar, volta sempre à página `/conta/verificar` ao entrar.

- **Em desenvolvimento**, sem e-mail/SMS configurados, o código aparece na consola do servidor e numa caixa amarela na página. Pode fixá-lo com `DEV_VERIFY_CODE=123456`.
- **Em produção**, configure o e-mail (Resend) e/ou SMS em Administrador → Configurações. Sem isso o membro não consegue confirmar a conta.

## Premium, pedidos e reservas

- **Subscrição pelo próprio membro**: na página Premium, o botão **Subscrever** abre um popup por passos (plano → M-Pesa → número). O membro confirma o PIN no telemóvel e o Premium fica ativo automaticamente (soma os meses se já for Premium). Os planos e preços estão em `lib/premium-plans.ts`. O admin é avisado por e-mail e no sino (“Novas subscrições Premium”), e **Administrador → Subscrições Premium** lista os pagamentos. Se aparecer “Por confirmar” (o M-Pesa não respondeu), confirme no extrato e ative em Membros.
- **Ativar o Premium à mão**: Administrador → Membros Riendzo AI → coluna *Premium* → escolha “+1/3/6/12 meses” → *Aplicar* (depois de confirmar o pagamento). Para **cancelar** o Premium de alguém: botão **Cancelar Premium** (em Membros ou em Subscrições Premium). A conta volta a gratuita de imediato e o membro recebe um e-mail.
- **Conta gratuita**: só restaurantes, no máximo **2 pedidos** (os recusados pelo restaurante não contam). Tem de deixar um telefone; o restaurante contacta-o por telefone e o cliente não vê o progresso em tempo real.
- **Premium**: restaurantes sem limite, reservas de alojamento (quartos), viaturas (rent-a-car) e passeios/serviços (guias turísticos e transportes), progresso em tempo real (Enviado → Em processamento → Pronto → Concluído), aviso no sino e por e-mail.
- **Todos os estabelecimentos com menu/quartos/viaturas/passeios aceitam pedidos**, no site e no Portal do membro. Com conta de proprietário (Administrador → Utilizadores), o pedido vai direto para o portal dele. **O estabelecimento torna-se Premium por subscrição**, pelos mesmos passos do utilizador (plano → M-Pesa → PIN), feita pelo proprietário em **Portal do estabelecimento → Premium**. Premium: o pedido chega ao portal (menu **Pedidos**, com filtros por estado, estabelecimento, período e pesquisa, e paginação) e o cliente acompanha cada passo. **Sem Premium**, o pedido é enviado por e-mail e SMS para o e-mail e o telefone que o estabelecimento indicou ao registar-se; a Riendzo não encaminha nem acompanha estes pedidos e o cliente é avisado de que o estabelecimento não é Premium. As subscrições de estabelecimentos aparecem em **Administrador → Subscrições**, onde também se pode definir ou cancelar o Premium.
- **Listas do Administrador** (Membros, Utilizadores, Subscrições, Doações, Mensagens, Pedidos): têm pesquisa e paginação (20 por página) e filtros por estado/tipo.
- **Portal do proprietário → Pedidos**: lista que se atualiza sozinha, com contador de novos. “Confirmar receção” põe o pedido “Em processamento”; depois “Pronto/Confirmar reserva” e “Concluir”; ou “Recusar” com motivo.
- Os preços vêm sempre da página do estabelecimento. O pagamento da comida ou do quarto é feito diretamente ao estabelecimento.

## Doações (M-Pesa)

Página pública `/doar` (ligação no rodapé): 10, 20, 50, 100 MT ou outro valor. O doador escreve o número M-Pesa (84/85) e, ao clicar em “Efetuar Pagamento”, recebe no telemóvel o pedido para introduzir o PIN. e-Mola e mKesh aparecem como “em breve”.

1. Obtenha no Developer Portal da Vodacom (M-Pesa Open API Moçambique) a **API key**, a **chave pública** e o **código do serviço**.
2. Preencha `MPESA_API_KEY`, `MPESA_PUBLIC_KEY`, `MPESA_SERVICE_PROVIDER_CODE` e `MPESA_ENV` (`sandbox` para testar, `live` em produção).
3. **Sem credenciais, em desenvolvimento, o pagamento é simulado** (nada é debitado). Em produção sem credenciais, os pagamentos ficam desativados.
4. Administrador → **Doações** lista tudo, com a referência (`RDZ…`). “Por confirmar” = o M-Pesa não respondeu a tempo: confirme no extrato antes de dar como falhado.

## Apps Android e iOS, instalação e eliminação de conta

- O site é **instalável** (PWA): tem manifesto, ícones e uma página “Sem ligação”. O service worker (`public/sw.js`) **só** mostra essa página sem internet: não guarda páginas nem dados.
- As apps nativas estão na pasta `riendzo-mobile/` (Capacitor). Siga o `riendzo-mobile/README.md`.
- **Eliminar conta**: o membro faz em *O meu perfil → Eliminar a minha conta* (palavra-passe + escrever ELIMINAR). Apaga o perfil, favoritos, locais e fotografias; os pedidos e pagamentos ficam no histórico **sem nome nem telefone**. Não é possível com pedidos em curso. Página pública: `/eliminar-conta` (é o endereço que as lojas pedem).
- A **política de privacidade** (`/privacidade`) foi atualizada com pedidos, pagamentos, locais e localização. Continua a ser um texto-modelo: peça a revisão de um jurista antes de publicar nas lojas.
