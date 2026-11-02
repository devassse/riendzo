"use client";

import { useLocale } from "next-intl";
import styles from "@/app/css/weather.module.css";
import { useWeather } from "./use-weather";
import WeatherIcon from "./weather-icon";
import { conditionLabel, weatherLabels } from "./weather-labels";

/** Weather card for the hero: big temperature, condition and today's day/night range. */
export default function WeatherCard() {
    const locale = useLocale();
    const { weather: w, loading } = useWeather();
    const t = weatherLabels(locale);

    if (!loading && !w) return null;
    if (!w) return <div className={`${styles.card} ${styles.skeleton}`} aria-hidden="true" />;

    const label = conditionLabel(t, w.condition, w.isDay);
    return (
        <section className={styles.card} aria-label={`${t.weather} ${w.location}: ${w.temp}°C, ${label}`}>
            <div className={styles.row}>
                <span className={styles.temp}>{w.temp}°</span>
                <WeatherIcon condition={w.condition} isDay={w.isDay} size={60} className={styles.icon} />
            </div>
            <p className={styles.cond}>{label}</p>
            <p className={styles.range}>
                {t.day} {w.dayMax}° • {t.night} {w.nightMin}°
            </p>
            <p className={styles.place}>{w.location}</p>
        </section>
    );
}
