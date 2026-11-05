'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import SocialLinks from '../utils/social-links';
import ThemeToggle from '../utils/theme-toggle';
import { WEATHER_URL } from '@/lib/weather-url';
import styles from '@/app/css/weather.module.css';
import { useWeather } from '../weather/use-weather';
import WeatherIcon from '../weather/weather-icon';

const INTL: Record<string, string> = { pt: 'pt-MZ', en: 'en' };

/** Fixed bar above the header: today's date (Maputo time), weather and quick links. */
export default function RiendzoTopbar() {
  const locale = useLocale();
  const t = useTranslations('Topbar');
  const { weather: w } = useWeather();
  const [date, setDate] = useState('');

  // Computed after mount so the server and the browser never disagree on "today"
  useEffect(() => {
    const format = () => {
      const text = new Intl.DateTimeFormat(INTL[locale] ?? 'pt-MZ', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Maputo',
      }).format(new Date());
      setDate(text.charAt(0).toUpperCase() + text.slice(1));
    };
    format();
    const id = setInterval(format, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [locale]);

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.date}>{date || '\u00A0'}</span>
          {w && (
            <a href={WEATHER_URL} target="_blank" rel="noopener noreferrer" className={styles.weather} title="Ver a previsão completa">
              <WeatherIcon condition={w.condition} isDay={w.isDay} size={16} className={styles.weatherIcon} />
              {w.location} {w.temp}°C
            </a>
          )}
        </div>
        <div className={styles.right}>
          <form action={`/${locale}/pesquisa`} role="search" className={styles.search}>
            <input name="q" type="search" placeholder={t('search')} aria-label={t('search')} autoComplete="off" />
            <button type="submit" aria-label={t('searchButton')}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.300-4.300" /></svg>
            </button>
          </form>
          <ThemeToggle tone="light" />
          <SocialLinks size={15} tone="light" />
        </div>
      </div>
    </div>
  );
}
