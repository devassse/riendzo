import type { Metadata } from "next";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import "@/app/css/globals.css";
import { THEME_INIT } from "@/app/components/utils/theme-init";
import { getMenuFlags } from "@/lib/cms/menus";
import { NavFlagsProvider } from "@/app/components/utils/nav-flags";

export const metadata: Metadata = {
  title: "Riendzo",
  description: "Assistente de Viagens",
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}