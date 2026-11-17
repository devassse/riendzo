import type { Condition } from "@/lib/weather";

type Dict = { conditions: Record<Condition, string>; clearNight: string; day: string; night: string; weather: string; forecast: string };

const PT: Dict = {
    conditions: {
        clear: "Ensolarado", fair: "Bom tempo", "partly-cloudy": "Parcialmente nublado", cloudy: "Nublado",
        fog: "Nevoeiro", drizzle: "Chuvisco", rain: "Chuva", showers: "Aguaceiros", thunderstorm: "Trovoada",
    },
    clearNight: "Céu limpo", day: "Dia", night: "Noite", weather: "Tempo em", forecast: "Ver a previsão completa",
};
const EN: Dict = {
    conditions: {
        clear: "Sunny", fair: "Fair", "partly-cloudy": "Partly cloudy", cloudy: "Cloudy",
        fog: "Fog", drizzle: "Drizzle", rain: "Rain", showers: "Showers", thunderstorm: "Thunderstorms",
    },
    clearNight: "Clear", day: "Day", night: "Night", weather: "Weather in", forecast: "See the full forecast",
};

/* Drafts in the local languages: to be reviewed by a specialist of each language. */
const TS: Dict = {
    conditions: { clear: "Dyambu", fair: "Nkarhi lowunene", "partly-cloudy": "Mapapa yo karhi", cloudy: "Mapapa", fog: "Mpfumawulo", drizzle: "Mpfula yo kanyana", rain: "Mpfula", showers: "Tinghati ta mpfula", thunderstorm: "Ndlhopfu" },
    clearNight: "Tilo ro tenga", day: "Nhlikanhi", night: "Vusiku", weather: "Nkarhi eka", forecast: "Vona vuvoni hinkwabyo",
};
const SE: Dict = {
    conditions: { clear: "Dzuwa", fair: "Nyengo yabwino", "partly-cloudy": "Mitambo pang'ono", cloudy: "Mitambo", fog: "Chifunga", drizzle: "Mvula yochepa", rain: "Mvula", showers: "Mvula yamphamvu", thunderstorm: "Bingu" },
    clearNight: "Thambo loyera", day: "Usana", night: "Usiku", weather: "Nyengo ku", forecast: "Onani zonse zolosera",
};
const KH: Dict = {
    conditions: { clear: "Nsuwa", fair: "Nthowa nnene", "partly-cloudy": "Mapuwa pang'ono", cloudy: "Mapuwa", fog: "Mpfumbi", drizzle: "Mvula yokhotha", rain: "Mvula", showers: "Mvula yikulu", thunderstorm: "Ntheleko" },
    clearNight: "Thambo", day: "Usana", night: "Usiku", weather: "Nthowa ku", forecast: "Wona onthe",
};
const BY_LOCALE: Record<string, Dict> = { pt: PT, en: EN, ts: TS, se: SE, kh: KH };

/** Falls back to Portuguese for any other locale. */
export const weatherLabels = (locale: string): Dict => BY_LOCALE[locale] ?? PT;

export const conditionLabel = (d: Dict, c: Condition, isDay: boolean) =>
    c === "clear" && !isDay ? d.clearNight : d.conditions[c];
