# Riendzo — apps Android e iOS

As apps são uma "casca" nativa (Capacitor) que abre o site Riendzo já publicado. Assim, tudo o que
mudar no `webapp` (pedidos, Premium, conta…) aparece nas apps sem as voltar a submeter às lojas.

> O site tem de estar **publicado em HTTPS**: a app não funciona só com o código, precisa do endereço do servidor.

## 1. Pré-requisitos
- Node.js 20 ou superior.
- **Android:** Android Studio (com o SDK instalado). Conta Google Play Console (taxa única) para publicar.
- **iOS:** um Mac com Xcode 16 ou superior e uma conta Apple Developer (anual). O iOS não se compila em Windows nem Linux.

## 2. Definir o endereço do site
Em `capacitor.config.json`, troque `SEU-DOMINIO.com` pelo domínio real (nos 3 sítios: `url`, `allowNavigation` ×2).
Se quiser mudar o identificador da app (`com.riendzo.app`), faça-o **antes** do passo seguinte: depois de publicada, não se muda.

## 3. Criar os projetos nativos (uma só vez)
```bash
cd mobile
npm install
npm run setup      # cria android/ e ios/, gera ícones e ecrã de arranque, e sincroniza
```
Os ícones e o ecrã de arranque saem da pasta `assets/` (logótipo branco sobre azul #0054b5).

## 4. Abrir e testar
```bash
npm run android    # abre o Android Studio → botão ▶ (emulador ou telemóvel)
npm run ios        # abre o Xcode → escolha o simulador → ▶
```
Depois de mudar o `capacitor.config.json`, corra `npm run sync`.

### Testar contra o seu computador (sem publicar)
Corra o webapp com `npm run dev` e use temporariamente em `server`:
- Android (emulador): `"url": "http://10.0.2.2:3000"`, `"cleartext": true`
- iOS (simulador): `"url": "http://localhost:3000"`
Volte a pôr o endereço HTTPS real antes de gerar a versão final.

## 5. Publicar
- **Android:** Android Studio → *Build → Generate Signed Bundle / APK* → **Android App Bundle (.aab)** → enviar para a Google Play Console.
- **iOS:** Xcode → *Product → Archive* → *Distribute App* → App Store Connect.
- Mudar o número da versão: `versionName`/`versionCode` em `android/app/build.gradle` e *Version/Build* no Xcode.

## 6. Pontos a ter em conta antes de submeter
1. **Subscrição Premium e pagamentos.** A Apple (regra 3.1.1) e a Google exigem o seu sistema de compras dentro da app para vender funcionalidades digitais. Pagar o Premium por M-Pesa dentro da app **pode levar à rejeição**. Opções: usar a compra nativa (In-App Purchase / Play Billing), ou esconder o botão "Subscrever" nas apps e deixar a subscrição só no site. Decida antes de submeter.
2. **Aprovação da Apple (regra 4.2).** Apps que são só um site embrulhado são por vezes rejeitadas. Ajuda acrescentar funções nativas (por exemplo notificações push) e preencher bem a descrição e as capturas de ecrã.
3. **Política de privacidade e eliminação de conta.** As duas lojas pedem o endereço da política de privacidade e uma forma de eliminar a conta (o site já tem a eliminação de conta no portal).
4. **Sem internet** a app mostra `www/offline.html` com o botão "Tentar novamente".
5. Links externos (telefone, WhatsApp, e-mail, outros sites) abrem fora da app; só o domínio em `allowNavigation` abre dentro dela.
