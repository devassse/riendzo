import type { CapacitorConfig } from "@capacitor/cli";

/**
 * As apps abrem o site da Riendzo (Next.js) dentro de uma app nativa.
 *
 *   RIENDZO_URL=https://o-seu-dominio.com npx cap sync      → apps de produção
 *   RIENDZO_URL=http://192.168.1.20:3000 npx cap sync       → testar contra o seu `npm run dev` (só Android)
 *
 * Sem RIENDZO_URL a app mostra www/index.html (um aviso de configuração em falta).
 */
const url = process.env.RIENDZO_URL?.replace(/\/$/, "");

const config: CapacitorConfig = {
  // ATENÇÃO: o appId identifica a app nas lojas e NÃO pode mudar depois de publicada.
  // Use o domínio que é seu, ao contrário (ex.: "mz.riendzo.app"). Confirme antes de `npx cap add`.
  appId: "com.riendzo.app",
  appName: "Riendzo",
  webDir: "www",
  server: url
    ? { url, cleartext: url.startsWith("http://"), allowNavigation: [new URL(url).host] }
    : undefined,
  ios: {
    // a web view respeita o entalhe e a barra de estado
    contentInset: "always",
    backgroundColor: "#ffffff",
  },
  android: {
    backgroundColor: "#ffffff",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: "#ffffff",
      showSpinner: false,
    },
  },
};

export default config;
