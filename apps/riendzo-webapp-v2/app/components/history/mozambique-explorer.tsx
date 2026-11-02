"use client";

import { useMemo, useState } from "react";
import { LANGUAGES, MAP, PROVINCES, TOTAL_POPULATION_2017, outlinePath, project } from "@/lib/data/mozambique";

const nf = (n: number, d = 1) => n.toLocaleString("pt-PT", { minimumFractionDigits: d, maximumFractionDigits: d });

/** Schematic map of Mozambique (not a cartographic source). */
function MapSvg({ children, label }: { children: React.ReactNode; label: string }) {
    return (
        <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} role="img" aria-label={label} className="mx-auto h-auto w-full max-w-[26rem]">
            <path d={outlinePath()} fill="#eef2f8" stroke="#0b122033" strokeWidth="2" strokeLinejoin="round" />
            {children}
        </svg>
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
                <MapSvg label="Mapa esquemático das línguas de Moçambique">
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
                <MapSvg label="Mapa esquemático das províncias de Moçambique">
                    {PROVINCES.map((p) => {
                        const c = project(p.at);
                        const on = p.id === sel;
                        return (
                            <g key={p.id} className="cursor-pointer" onClick={() => setSel(p.id)}>
                                <circle cx={c.x} cy={c.y} r={7 + p.population * 3.2} fill="#0054b5" fillOpacity={on ? 0.8 : 0.35} stroke="#0054b5" strokeWidth={on ? 3 : 1}><title>{p.name}</title></circle>
                                <text x={c.x} y={c.y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={on ? "#fff" : "#0b1220"} pointerEvents="none">{p.population.toLocaleString("pt-PT")}</text>
                            </g>
                        );
                    })}
                </MapSvg>
                <p className="mt-2 text-center text-[11px] text-[#5b6478]">Mapa esquemático. O número é a população em milhões (Censo 2017).</p>
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
