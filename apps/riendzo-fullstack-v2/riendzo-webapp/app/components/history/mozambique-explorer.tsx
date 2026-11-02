"use client";

import { useMemo, useState } from "react";
import { LANGUAGES, MAP, PROVINCES, TOTAL_POPULATION_2017, project } from "@/lib/data/mozambique";
import { COUNTRY_PATH, LAKE_NIASSA_PATH, PROVINCE_PATHS, PROVINCE_POLES } from "@/lib/data/mozambique-map";

const nf = (n: number, d = 1) => n.toLocaleString("pt-PT", { minimumFractionDigits: d, maximumFractionDigits: d });

const COLORS: Record<string, string> = {
    "cabo-delgado": "#14532d", niassa: "#94a3b8", nampula: "#38bdf8", zambezia: "#f97316", tete: "#9a3412",
    manica: "#7c4dbd", sofala: "#22c55e", inhambane: "#2563eb", gaza: "#eab308", "maputo-provincia": "#ef4444", "maputo-cidade": "#7f1d1d",
};
const SHORT: Record<string, string> = { "maputo-provincia": "Maputo", "cabo-delgado": "Cabo Delgado" };
/** Provincial capitals ([longitude, latitude]). */
const CAPITALS: { id: string; name: string; at: [number, number] }[] = [
    { id: "niassa", name: "Lichinga", at: [35.24, -13.31] }, { id: "cabo-delgado", name: "Pemba", at: [40.52, -12.97] },
    { id: "nampula", name: "Nampula", at: [39.27, -15.12] }, { id: "zambezia", name: "Quelimane", at: [36.89, -17.88] },
    { id: "tete", name: "Tete", at: [33.59, -16.16] }, { id: "manica", name: "Chimoio", at: [33.48, -19.12] },
    { id: "sofala", name: "Beira", at: [34.84, -19.84] }, { id: "inhambane", name: "Inhambane", at: [35.38, -23.87] },
    { id: "gaza", name: "Xai-Xai", at: [33.64, -25.05] }, { id: "maputo-cidade", name: "Maputo", at: [32.57, -25.97] },
];

/** Schematic map of Mozambique (not a cartographic source): sea, country, provinces, Lake Niassa. */
function MapSvg({ children, label, below }: { children?: React.ReactNode; label: string; below?: React.ReactNode }) {
    return (
        <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} role="group" aria-label={label} className="mx-auto h-auto w-full max-w-[26rem] overflow-hidden rounded-3xl">
            <defs>
                <linearGradient id="moz-sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#eaf5ff" /><stop offset="1" stopColor="#cfe6fa" /></linearGradient>
                <filter id="moz-shadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#0b3d78" floodOpacity="0.28" /></filter>
            </defs>
            <rect width={MAP.width} height={MAP.height} fill="url(#moz-sea)" />
            <text transform={`translate(${MAP.width - 70} ${MAP.height * 0.74}) rotate(-90)`} textAnchor="middle" fontSize="15" fontStyle="italic" letterSpacing="7" fill="#2b6cb0" opacity="0.55">OCEANO ÍNDICO</text>
            <text transform={`translate(${MAP.width * 0.58} ${MAP.height * 0.45}) rotate(-72)`} textAnchor="middle" fontSize="10" fontStyle="italic" letterSpacing="2" fill="#2b6cb0" opacity="0.5">Canal de Moçambique</text>
            <path d={COUNTRY_PATH} fill="#fff" stroke="#0b1220" strokeOpacity="0.35" strokeWidth="3" strokeLinejoin="round" filter="url(#moz-shadow)" />
            {below}
            <path d={LAKE_NIASSA_PATH} fill="#38bdf8" stroke="#0b6bbd" strokeWidth="1.5" strokeOpacity="0.5" />
            <text transform="translate(176 130) rotate(-84)" textAnchor="middle" fontSize="9" fontStyle="italic" fill="#0b5fa8">Lago Niassa</text>
            {children}
        </svg>
    );
}

/** Province shapes in a calm tint (language map) or in colour (province map). */
function Provinces({ tone, sel, onSelect }: { tone: "light" | "color"; sel?: string; onSelect?: (id: string) => void }) {
    return (
        <g>
            {Object.entries(PROVINCE_PATHS).map(([id, d]) => {
                const on = id === sel || (id === "maputo-provincia" && sel === "maputo-cidade");
                const dim = tone === "color" && sel && !on;
                const name = PROVINCES.find((p) => p.id === id)?.name ?? id;
                return (
                    <path
                        key={id} d={d} fill={tone === "color" ? COLORS[id] : "#f1f5fa"} fillOpacity={dim ? 0.45 : 1}
                        stroke="#fff" strokeWidth={on ? 4 : 2.5} strokeLinejoin="round"
                        className={onSelect ? "cursor-pointer outline-none transition-[fill-opacity] duration-200" : undefined}
                        {...(onSelect ? { onClick: () => onSelect(id), role: "button", tabIndex: 0, "aria-label": name, "aria-pressed": on, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(id); } } } : {})}
                    ><title>{name}</title></path>
                );
            })}
        </g>
    );
}

/** Languages and peoples: map with the heartland of each language, filters and details. */
export function LanguageExplorer() {
    const [sel, setSel] = useState<string>("emakhuwa");
    const [group, setGroup] = useState("all");
    const groups = useMemo(() => [...new Set(LANGUAGES.filter((l) => l.area).map((l) => l.group))], []);
    const visible = LANGUAGES.filter((l) => l.area && (group === "all" || l.group === group));
    const cur = LANGUAGES.find((l) => l.id === sel) ?? LANGUAGES[0];

    return (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_1fr]">
            <div>
                <MapSvg label="Mapa esquemático das línguas de Moçambique" below={<Provinces tone="light" />}>
                    {visible.map((l) => {
                        const [lon, lat, r] = l.area!;
                        const c = project([lon, lat]);
                        const on = l.id === sel;
                        return (
                            <circle key={l.id} cx={c.x} cy={c.y} r={r * MAP.scale * 0.95} fill={l.color} fillOpacity={on ? 0.75 : 0.32} stroke={l.color} strokeWidth={on ? 3 : 1} className="cursor-pointer transition-all" onClick={() => setSel(l.id)}>
                                <title>{l.name}</title>
                            </circle>
                        );
                    })}
                    {PROVINCES.map((p) => {
                        const c = project(p.at);
                        return <circle key={p.id} cx={c.x} cy={c.y} r="2.5" fill="#0b1220" opacity="0.5" />;
                    })}
                </MapSvg>
                <p className="mt-2 text-center text-[11px] text-[#5b6478]">Mapa esquemático: indica a região principal de cada língua, sem fronteiras exatas.</p>
            </div>

            <div>
                <div className="grid grid-cols-3 gap-3 text-center">
                    {[["21", "línguas no Censo 2017"], ["26,3 %", "falam Emakhuwa"], ["47,4 %", "falam Português"]].map(([v, l]) => (
                        <div key={l} className="rounded-2xl border border-[#0b1220]/10 p-3"><p className="font-baloo text-2xl font-bold text-[#0054b5]">{v}</p><p className="text-[11px] text-[#5b6478]">{l}</p></div>
                    ))}
                </div>

                <div role="tablist" aria-label="Famílias linguísticas" className="mt-5 flex flex-wrap gap-2">
                    {["all", ...groups].map((g) => (
                        <button key={g} type="button" role="tab" aria-selected={group === g} onClick={() => setGroup(g)} className="cursor-pointer rounded-full border px-3 py-1 text-xs font-baloo font-medium" style={{ borderColor: group === g ? "#0b1220" : "#0b12201a", backgroundColor: group === g ? "#0b1220" : "transparent", color: group === g ? "#fff" : "#0b1220" }}>
                            {g === "all" ? "Todas" : g}
                        </button>
                    ))}
                </div>

                <ul className="mt-4 flex flex-wrap gap-2">
                    {LANGUAGES.filter((l) => group === "all" || l.group === group || !l.area).map((l) => (
                        <li key={l.id}>
                            <button type="button" onClick={() => setSel(l.id)} aria-pressed={l.id === sel} className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs" style={{ borderColor: l.id === sel ? l.color : "#0b12201a", backgroundColor: l.id === sel ? `${l.color}1f` : "transparent" }}>
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />{l.name}
                            </button>
                        </li>
                    ))}
                </ul>

                <article className="mt-5 rounded-3xl border p-5" style={{ borderColor: `${cur.color}66`, backgroundColor: `${cur.color}0d` }} aria-live="polite">
                    <p className="text-[10px] font-montserrat-italic uppercase tracking-[0.18em]" style={{ color: cur.color }}>{cur.group}</p>
                    <h3 className="font-baloo text-2xl font-bold text-[#0b1220]">{cur.name}{cur.aka && <span className="text-base font-normal text-[#5b6478]"> · {cur.aka}</span>}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#1b2433]">{cur.note}</p>
                    <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        <div><dt className="text-[10px] uppercase tracking-[0.16em] text-[#5b6478]">Onde se fala</dt><dd>{cur.provinces.join(", ")}</dd></div>
                        {cur.percent !== undefined && <div><dt className="text-[10px] uppercase tracking-[0.16em] text-[#5b6478]">Língua materna (Censo 2017)</dt><dd>{nf(cur.percent)} % da população</dd></div>}
                    </dl>
                </article>
                <p className="mt-3 text-xs text-[#5b6478]">Em vez de “tribos”, fala-se em grupos etnolinguísticos: comunidades que partilham língua, história e cultura. A maioria das línguas de Moçambique é bantu. Fonte: INE, Censo 2017.</p>
            </div>
        </div>
    );
}

/** Provinces and demographics: map with population bubbles, ranking and details. */
export function ProvinceExplorer() {
    const [sel, setSel] = useState<string>("maputo-cidade");
    const sorted = useMemo(() => [...PROVINCES].sort((a, b) => b.population - a.population), []);
    const max = sorted[0].population;
    const cur = PROVINCES.find((p) => p.id === sel) ?? PROVINCES[0];

    return (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_1fr]">
            <div>
                <MapSvg label="Mapa esquemático das províncias de Moçambique" below={<Provinces tone="color" sel={sel} onSelect={setSel} />}>
                    {/* names */}
                    {Object.entries(PROVINCE_POLES).map(([id, [x, y]]) => (
                        <text key={id} x={x} y={y + 4} textAnchor="middle" fontSize={id === "maputo-provincia" || id === "manica" ? 10 : 13} fontWeight="800" fill="#fff" stroke="#0b1220" strokeOpacity="0.55" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{SHORT[id] ?? PROVINCES.find((p) => p.id === id)?.name}</text>
                    ))}
                    {/* capitals */}
                    {CAPITALS.map((c) => {
                        const q = project(c.at);
                        const on = c.id === sel || (c.id === "maputo-cidade" && sel === "maputo-cidade");
                        return (
                            <g key={c.id} className={c.id === "maputo-cidade" ? "cursor-pointer" : undefined} onClick={c.id === "maputo-cidade" ? () => setSel("maputo-cidade") : undefined}>
                                <circle cx={q.x} cy={q.y} r={c.id === "maputo-cidade" ? 7 : 4} fill={c.id === "maputo-cidade" ? COLORS["maputo-cidade"] : "#0b1220"} stroke="#fff" strokeWidth="2"><title>{c.name}</title></circle>
                                {(on || c.id === sel) && <text x={q.x + 9} y={q.y + 4} fontSize="11" fontWeight="700" fill="#0b1220" stroke="#fff" strokeWidth="3" paintOrder="stroke">{c.name}</text>}
                            </g>
                        );
                    })}
                </MapSvg>
                <p className="mt-2 text-center text-[11px] text-[#5b6478]">Mapa esquemático: toque numa província para ver os detalhes. Pontos: capitais provinciais.</p>
            </div>

            <div>
                <div className="grid grid-cols-3 gap-3 text-center">
                    {[[nf(TOTAL_POPULATION_2017), "milhões de habitantes (2017)"], ["11", "províncias"], [nf(TOTAL_POPULATION_2017 * 1e6 / PROVINCES.reduce((n, p) => n + p.area, 0), 0), "hab./km² (média)"]].map(([v, l]) => (
                        <div key={l} className="rounded-2xl border border-[#0b1220]/10 p-3"><p className="font-baloo text-2xl font-bold text-[#0054b5]">{v}</p><p className="text-[11px] text-[#5b6478]">{l}</p></div>
                    ))}
                </div>

                <ol className="mt-5 space-y-1.5" aria-label="População por província">
                    {sorted.map((p) => (
                        <li key={p.id}>
                            <button type="button" onClick={() => setSel(p.id)} aria-pressed={p.id === sel} className="grid w-full cursor-pointer grid-cols-[8.5rem_1fr_3rem] items-center gap-3 rounded-lg px-2 py-1 text-left text-xs hover:bg-[#eef2f8]" style={p.id === sel ? { backgroundColor: "#0054b514" } : undefined}>
                                <span className="truncate font-medium">{p.name}</span>
                                <span className="h-2.5 rounded-full bg-[#e6ebf3]"><span className="block h-full rounded-full bg-[#0054b5]" style={{ width: `${(p.population / max) * 100}%` }} /></span>
                                <span className="text-right tabular-nums">{nf(p.population)} M</span>
                            </button>
                        </li>
                    ))}
                </ol>

                <article className="mt-5 rounded-3xl border border-[#0054b5]/30 bg-[#0054b5]/[0.05] p-5" aria-live="polite">
                    <h3 className="font-baloo text-2xl font-bold text-[#0b1220]">{cur.name}</h3>
                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                        <div><dt className="text-[10px] uppercase tracking-[0.16em] text-[#5b6478]">Capital</dt><dd>{cur.capital}</dd></div>
                        <div><dt className="text-[10px] uppercase tracking-[0.16em] text-[#5b6478]">População (2017)</dt><dd>{nf(cur.population)} milhões</dd></div>
                        <div><dt className="text-[10px] uppercase tracking-[0.16em] text-[#5b6478]">Área</dt><dd>cerca de {cur.area.toLocaleString("pt-PT")} km²</dd></div>
                        <div><dt className="text-[10px] uppercase tracking-[0.16em] text-[#5b6478]">Densidade</dt><dd>cerca de {nf((cur.population * 1e6) / cur.area, 0)} hab./km²</dd></div>
                        <div className="sm:col-span-2"><dt className="text-[10px] uppercase tracking-[0.16em] text-[#5b6478]">Cidades e distritos a conhecer</dt><dd>{cur.places.join(" · ")}</dd></div>
                        <div className="sm:col-span-2"><dt className="text-[10px] uppercase tracking-[0.16em] text-[#5b6478]">Línguas principais</dt><dd>{cur.languages.join(", ")}</dd></div>
                    </dl>
                </article>
                <p className="mt-3 text-xs text-[#5b6478]">Valores arredondados. Fonte: INE, IV Recenseamento Geral da População (2017). A lista completa de distritos, postos administrativos, localidades e bairros pode ser acrescentada no BackOffice.</p>
            </div>
        </div>
    );
}
