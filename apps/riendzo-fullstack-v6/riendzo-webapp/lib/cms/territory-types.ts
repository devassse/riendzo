/** Administrative division below the provinces (client-safe: no server imports). */

export type TerritoryKind = "distrito" | "municipio" | "posto" | "localidade" | "bairro" | "outro";

/** `parents`: what each kind may belong to ("province" = directly to a province). */
export const TERRITORY_KINDS: { id: TerritoryKind; label: string; plural: string; emoji: string; parents: (TerritoryKind | "province")[] }[] = [
    { id: "distrito", label: "Distrito", plural: "Distritos", emoji: "🗺️", parents: ["province"] },
    { id: "municipio", label: "Município", plural: "Municípios", emoji: "🏛️", parents: ["distrito", "province"] },
    { id: "posto", label: "Posto administrativo", plural: "Postos administrativos", emoji: "📍", parents: ["distrito", "municipio"] },
    { id: "localidade", label: "Localidade", plural: "Localidades", emoji: "🏘️", parents: ["posto", "distrito", "municipio"] },
    { id: "bairro", label: "Bairro", plural: "Bairros", emoji: "🏠", parents: ["municipio", "localidade", "posto", "distrito"] },
    { id: "outro", label: "Povoação / outro", plural: "Povoações e outros", emoji: "📌", parents: ["province", "distrito", "municipio", "posto", "localidade", "bairro"] },
];

export const kindOf = (id: string) => TERRITORY_KINDS.find((k) => k.id === id);

export type Territory = {
    id: string;
    kind: TerritoryKind;
    name: string;
    /** "province:<id>" for a province, or the id of another territory */
    parent: string;
    population?: number;
    /** km² */
    area?: number;
    /** administrative seat */
    seat?: string;
    notes?: string;
};

export const provinceParent = (provinceId: string) => `province:${provinceId}`;
export const isProvinceParent = (p: string) => p.startsWith("province:");

/** Direct children of a node (a province key or a territory id). */
export const childrenOf = (all: Territory[], parent: string) => all.filter((t) => t.parent === parent).sort((a, b) => a.name.localeCompare(b.name, "pt"));

/** Every descendant of a province (any depth). */
export function descendantsOf(all: Territory[], parent: string): Territory[] {
    const out: Territory[] = [];
    const walk = (p: string) => childrenOf(all, p).forEach((c) => { out.push(c); walk(c.id); });
    walk(parent);
    return out;
}

/** The province a territory belongs to. */
export function provinceOf(all: Territory[], t: Territory): string | null {
    let cur: Territory | undefined = t;
    for (let i = 0; i < 10 && cur; i++) {
        if (isProvinceParent(cur.parent)) return cur.parent.slice("province:".length);
        cur = all.find((x) => x.id === cur!.parent);
    }
    return null;
}
