# Deploy do Riendzo (VPS com Docker)

Quatro serviços, tudo com `docker compose`: **db** (PostgreSQL) · **api** (Express + Prisma) · **web** (site + BackOffice) · **caddy** (HTTPS automático).
Só o Caddy fica exposto (portas 80/443); a base de dados e a API só se veem dentro da rede Docker.

```
.
├─ docker-compose.yml      produção (este)
├─ Caddyfile               domínio + HTTPS
├─ .env.example            copie para .env e preencha
├─ deploy.sh               atalhos: arrancar, seed, logs, backup…
├─ riendzo-api/            Dockerfile + docker-entrypoint.sh (aplica as migrations ao arrancar)
└─ riendzo-webapp/         Dockerfile (Next.js "standalone")
```

## 1. O servidor
- Linux (Ubuntu 22.04+ ou Debian 12), 2 GB de RAM no mínimo, 20 GB de disco.
- **Docker** com o plugin Compose: `curl -fsSL https://get.docker.com | sh` (confirme com `docker compose version`).
- **DNS**: um registo `A` do domínio (e de `www`) a apontar para o IP do servidor. Sem isto o HTTPS não arranca.
- **Firewall**: abra só 22, 80 e 443 (`ufw allow OpenSSH && ufw allow 80,443/tcp && ufw allow 443/udp && ufw enable`).

## 2. Colocar o projeto no servidor
Copie esta pasta inteira (`scp -r`, `rsync` ou git) para, por exemplo, `/opt/riendzo`.

## 3. Configurar
```bash
cd /opt/riendzo
cp .env.example .env
./deploy.sh secrets        # gera valores aleatórios → copie as linhas para o .env
nano .env                  # DOMAIN, SITE_URL, e as chaves
```
Obrigatórios: `DOMAIN`, `SITE_URL` (com `https://`), `POSTGRES_PASSWORD`, `JWT_SECRET`, `SERVICE_API_KEY`, `ADMIN_SESSION_SECRET`, `SETTINGS_SECRET`, `ADMIN_PASSWORD`.
O e-mail e os SMS podem ficar para depois: configuram-se no BackOffice (Administrador → Configurações).

> `SETTINGS_SECRET` cifra as chaves de e-mail/SMS guardadas. Defina-a uma vez e **não a mude** (ou terá de voltar a introduzir essas chaves).
> As variáveis `SOCIAL_*` e `SITE_URL` entram nas páginas ao construir a imagem: se as mudar, corra `./deploy.sh` outra vez.

## 4. Arrancar
```bash
./deploy.sh                # constrói as imagens e arranca tudo (a 1ª vez demora alguns minutos)
./deploy.sh seed           # SÓ na 1ª vez: carrega o conteúdo inicial na base de dados
./deploy.sh status         # tudo "healthy"?
./deploy.sh logs web       # se algo falhar
```
Abra `https://o-seu-dominio` e entre em `https://o-seu-dominio/admin` com `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
A API aplica sozinha as migrations (estrutura + dados básicos) sempre que arranca.

## 5. Onde ficam os dados (volumes Docker)
| Volume | Conteúdo |
|---|---|
| `pgdata` | base de dados: conteúdos, listas, menus, utilizadores, mensagens… |
| `webdata` | ficheiros do site: fotografias e vídeos carregados, Home, textos das páginas, membros… |
| `uploads` | ficheiros carregados através da API |
| `caddy_data` | certificados HTTPS (não apague) |

Trouxe dados de desenvolvimento (a pasta `riendzo-webapp/data`)? `./deploy.sh import-data` copia-a para o servidor.

## 6. Cópias de segurança
```bash
./deploy.sh backup         # cria ./backups/db-*.sql.gz, web-data-*.tar.gz, api-uploads-*.tar.gz
```
Agende-o (`crontab -e`): `0 3 * * * cd /opt/riendzo && ./deploy.sh backup` e leve as cópias para fora do servidor.
Repor a base de dados: `gunzip -c backups/db-AAAA.sql.gz | docker compose exec -T db psql -U riendzo riendzo`.

## 7. Atualizar o site
Substitua os ficheiros do projeto e corra `./deploy.sh` outra vez. Os volumes (e por isso os dados) mantêm-se; novas migrations aplicam-se sozinhas.

## 8. Antes de anunciar
- [ ] `https://dominio` abre com cadeado e `/admin` pede login.
- [ ] Trocou a palavra-passe do administrador e criou utilizadores reais (Administrador → Utilizadores).
- [ ] Administrador → Configurações: e-mail (Resend, com o domínio verificado) e, se quiser, SMS. Faça um envio de teste.
- [ ] Mudou o endereço das redes sociais (`SOCIAL_*`) para os reais.
- [ ] Escolheu o vídeo do hero e as 6 experiências (BackOffice → Home).
- [ ] Testou o registo de um membro e a recuperação de palavra-passe.
- [ ] Tem uma cópia de segurança agendada.

## Problemas comuns
- **O Caddy não obtém o certificado**: confirme o DNS (`dig +short dominio`) e as portas 80/443; veja `./deploy.sh logs caddy`.
- **`api` reinicia sem parar**: normalmente falta uma variável no `.env` ou a base de dados ainda não estava pronta; veja `./deploy.sh logs api`.
- **O vídeo do hero não carrega**: o limite é de 60 MB (e 70 MB no Caddy); comprima o vídeo.
- **Mudei o `.env` e nada mudou**: `docker compose up -d` recria os serviços alterados; para `SITE_URL`/`SOCIAL_*` é preciso reconstruir (`./deploy.sh`).
