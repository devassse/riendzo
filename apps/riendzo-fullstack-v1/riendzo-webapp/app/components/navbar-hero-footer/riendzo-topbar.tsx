'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import styles from '@/app/css/weather.module.css';
import { useWeather } from '../weather/use-weather';
import WeatherIcon from '../weather/weather-icon';

const INTL: Record<string, string> = { pt: 'pt-MZ', en: 'en' };

/** Fixed bar above the header: today's date (Maputo time), weather and quick links. */
export default function RiendzoTopbar() {
  const locale = useLocale();
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
            <span className={styles.weather}>
              <WeatherIcon condition={w.condition} isDay={w.isDay} size={16} className={styles.weatherIcon} />
              {w.location} {w.temp}°C
            </span>
          )}
        </div>
        <nav className={styles.right} aria-label="Links rápidos">
          <Link href="/contactos">Newsletter</Link>
          {/* /admin lives outside the i18n routing */}
          <a href="/admin">Backoffice</a>
        </nav>
      </div>
    </div>
  );
}
