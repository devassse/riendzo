import {getTranslations} from 'next-intl/server';

export default async function HistoriaPage() {
  const t = await getTranslations('History');

  return (
    <main>
      <h1>{t('title')}</h1>

      <ul>
        <li>{t('ancient')}</li>
        <li>{t('colonial')}</li>
        <li>{t('modern')}</li>
      </ul>
    </main>
  );
}