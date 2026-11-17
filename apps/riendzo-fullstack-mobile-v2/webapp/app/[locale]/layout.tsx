import type { Metadata, Viewport } from "next";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import "@/app/css/globals.css";
import { THEME_INIT } from "@/app/components/utils/theme-init";
import { getMenuFlags } from "@/lib/cms/menus";
import { NavFlagsProvider } from "@/app/components/utils/nav-flags";
import PwaRegister from "@/app/components/utils/pwa-register";

export const metadata: Metadata = {
  title: "Riendzo",
  description: "Assistente de Viagens",
  applicationName: "Riendzo",
  // iPhone: "Add to Home Screen" opens it like an app
  appleWebApp: { capable: true, title: "Riendzo", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0054b5",
  width: "device-width",
  initialScale: 1,
  // lets the page use the whole screen on phones with a notch (the app shells need it)
  viewportFit: "cover",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const messages = await getMessages();
  const flags = await getMenuFlags();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_INIT }} /></head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <NavFlagsProvider flags={flags}>{children}</NavFlagsProvider>
          <PwaRegister />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}