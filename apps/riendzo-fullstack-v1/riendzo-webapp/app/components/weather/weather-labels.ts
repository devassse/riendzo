import type { Condition } from "@/lib/weather";

type Dict = { conditions: Record<Condition, string>; clearNight: string; day: string; night: string; weather: string };

const PT: Dict = {
    conditions: {
        clear: "Ensolarado", fair: "Bom tempo", "partly-cloudy": "Parcialmente nublado", cloudy: "Nublado",
        fog: "Nevoeiro", drizzle: "Chuvisco", rain: "Chuva", showers: "Aguaceiros", thunderstorm: "Trovoada",
    },
    clearNight: "Céu limpo", day: "Dia", night: "Noite", weather: "Tempo em",
};
const EN: Dict = {
    conditions: {
        clear: "Sunny", fair: "Fair", "partly-cloudy": "Partly cloudy", cloudy: "Cloudy",
        fog: "Fog", drizzle: "Drizzle", rain: "Rain", showers: "Showers", thunderstorm: "Thunderstorms",
    },
    clearNight: "Clear", day: "Day", night: "Night", weather: "Weather in",
};

/** pt for every locale except en (the local-language files have no weather strings yet). */
export const weatherLabels = (locale: string): Dict => (locale === "en" ? EN : PT);

export const conditionLabel = (d: Dict, c: Condition, isDay: boolean) =>
    c === "clear" && !isDay ? d.clearNight : d.conditions[c];
