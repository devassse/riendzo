# Riendzo Mobile (Android e iOS)

Apps nativas feitas com [Capacitor](https://capacitorjs.com): a app abre o **site da Riendzo em produção** dentro de uma app
real. Tudo o que está no site (pedidos, Premium, locais, doações…) aparece nas apps sem duplicar código, e uma correção no
site chega às duas apps.

> **Estado:** base preparada. Ainda não foi compilada nem testada num telemóvel. Siga os passos e veja a lista “Verificar no dispositivo”.

## Antes de começar

| | Android | iOS |
|---|---|---|
| Computador | Mac, Windows ou Linux | **Mac** |
| Ferramenta | [Android Studio](https://developer.android.com/studio) | **Xcode** (App Store) + CocoaPods |
| Conta de programador | Google Play Console (pagamento único) | Apple Developer Program (anual) |

Precisa também de Node.js 20+ e do **site em produção com HTTPS** (veja `../DEPLOY.md`).

## 1. Instalar

```bash
cd riendzo-mobile
npm install @capacitor/core @capacitor/android @capacitor/ios @capacitor/splash-screen
npm install -D @capacitor/cli @capacitor/assets typescript
```

(Sem versões fixas de propósito: instala as mais recentes. Se algo falhar, `npm run doctor` diz o que falta.)

## 2. Confirmar o identificador da app

Em `capacitor.config.ts`, o `appId` (agora `com.riendzo.app`) **não pode mudar depois de a app ser publicada**.
Use o domínio que é seu, ao contrário (ex.: `mz.riendzo.app`).

## 3. Criar os projetos nativos

```bash
npx cap add android
npx cap add ios        # só num Mac
```

## 4. Ícones e ecrã de arranque

Os ficheiros de origem já estão em `assets/` (feitos a partir dos logos). Gere todos os tamanhos:

```bash
npm run assets
```

## 5. Apontar para o site

```bash
RIENDZO_URL=https://o-seu-dominio.com npm run sync
```

## 6. Abrir, correr e testar

```bash
npm run android     # abre o Android Studio → ▶ Run (emulador ou telemóvel com cabo)
npm run ios         # abre o Xcode → escolher um simulador → ▶ Run
```

Para testar contra o seu `npm run dev` (computador e telemóvel na mesma rede Wi-Fi):
`RIENDZO_URL=http://IP-DO-SEU-COMPUTADOR:3000 npm run sync`. Funciona no Android; no iOS o http simples costuma ser
bloqueado, use um endereço https.

## 7. Publicar

- **Android:** Android Studio → *Build → Generate Signed Bundle* (AAB) → Google Play Console. **Guarde a chave de assinatura
  em segurança**: sem ela não consegue atualizar a app.
- **iOS:** Xcode → *Product → Archive* → *Distribute App* → App Store Connect → TestFlight → revisão.

### Lista para as lojas

- [ ] **Eliminação de conta**: já existe no site (*O meu perfil → Eliminar a minha conta*). URL para os formulários das lojas: `https://o-seu-dominio.com/eliminar-conta`.
- [ ] **Política de privacidade**: `https://o-seu-dominio.com/privacidade`. O texto atual é um modelo: **peça a revisão de um jurista**.
- [ ] **Conta de teste para os revisores**: criar um membro **já verificado** (os revisores não recebem SMS nem o seu e-mail) e indicar o login nas notas de revisão. Para ativar o Premium nessa conta: Administrador → Membros.
- [ ] **E-mail e SMS reais configurados** no servidor (Resend / SMS), senão ninguém consegue confirmar a conta.
- [ ] **Premium e doações**: ver abaixo.
- [ ] Capturas de ecrã, descrição, classificação etária e o formulário de privacidade/segurança de dados de cada loja.

## Pagamentos nas lojas (decisão por tomar)

- **Pedidos e reservas** pagos diretamente ao restaurante, hotel ou rent-a-car: não usam compra dentro da app.
- **Subscrição Premium** (desbloqueia funcionalidades): a Apple exige compra dentro da app (IAP) para isto, e a Google Play tem regra
  parecida para bens digitais. O M-Pesa funciona no **site**. Opções: (a) usar IAP/Play Billing nas apps; (b) não vender o Premium
  dentro das apps; (c) no Android, distribuir também o APK diretamente no site. **Decida antes de submeter ao iOS.**
- **Doações**: confirme com a Apple e a Google se a Riendzo, não sendo uma organização sem fins lucrativos, pode ter o botão nas apps.

## Verificar no dispositivo (ainda não testado)

- [ ] Margens do ecrã (entalhe, barra de estado e a barra inferior do iPhone) sem cortar o menu nem os botões.
- [ ] Iniciar sessão e a sessão manter-se depois de fechar a app.
- [ ] O popup de detalhes dos pratos e o de subscrição (`<dialog>`) abrem e fecham bem.
- [ ] Carregar fotografias de locais (galeria e câmara) e o botão “Usar a minha localização” pedem a permissão.
- [ ] Links externos (mapas, sites dos estabelecimentos) abrem no navegador e voltam à app.
- [ ] Sem internet aparece a página “Sem ligação”.

## Próximo passo

**Notificações push** (estado dos pedidos) e as funções nativas pedem um plugin, o Firebase (FCM) e o APNs. É também o que dá
à app valor nativo suficiente para a revisão da Apple, que costuma rejeitar apps que são “apenas um site”.
