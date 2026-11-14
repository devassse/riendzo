/**
 * Initial content for every collection: the data that used to be hard-coded
 * in the pages. A collection is seeded from here the first time it is read;
 * after the first save in the BackOffice the JSON file takes over.
 */
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import type { Recipe } from "@/app/[locale]/(pages)/gastronomia/receitas/recipes-grid";
import { PRAIAS } from "@/app/[locale]/(pages)/turismo/praias/praias";
import { PARQUES } from "@/app/[locale]/(pages)/turismo/parques/parques";
import { ROTEIROS } from "@/app/[locale]/(pages)/turismo/roteiros/roteiros";
import { DOCUMENTOS } from "@/app/[locale]/(pages)/servicos/documentos/documentos";
import { SAUDE } from "@/app/[locale]/(pages)/servicos/saude/saude";
import { EDUCACAO } from "@/app/[locale]/(pages)/servicos/educacao/educacao";
import { IMPOSTOS } from "@/app/[locale]/(pages)/servicos/impostos/impostos";
import { CINEMA } from "@/app/[locale]/(pages)/entretenimento/cinema/cinema";
import { EVENTOS } from "@/app/[locale]/(pages)/entretenimento/eventos/eventos";
import { DESPORTO } from "@/app/[locale]/(pages)/entretenimento/desporto/desporto";
import { JOGOS } from "@/app/[locale]/(pages)/entretenimento/jogos/jogos";
import { NOTICIAS } from "@/app/[locale]/(pages)/blog/noticias/noticias";
import { CULTURA } from "@/app/[locale]/(pages)/blog/cultura/cultura";
import { VIAGENS } from "@/app/[locale]/(pages)/blog/viagens/viagens";
import { OPINIAO } from "@/app/[locale]/(pages)/blog/opiniao/opiniao";
import { RECIPES } from "@/app/[locale]/(pages)/gastronomia/receitas/recipes-data";
import { HISTORY_ANCIENT, HISTORY_COLONIAL, HISTORY_MODERN } from "./seed-data/history";
import { ARTISTS, EVOLUTION, GENRES } from "./seed-data/music";
import { BANKS, COMMERCE, COMMS, CREATORS, EMERGENCY, FUEL, GUIDES, LODGING, RENTACAR, RESTAURANTS, SCHOOLS, TRANSPORT } from "./seed-data/places";
import type { Artist } from "./artist-types";
import { BEBIDAS } from "@/app/[locale]/(pages)/gastronomia/bebidas/bebidas-data";
import { MARISCOS } from "@/app/[locale]/(pages)/gastronomia/mariscos/mariscos-data";

export const SEEDS: Record<string, (CatalogItem | Recipe | Artist)[]> = {
    "tourism-beaches": PRAIAS,
    "tourism-parks": PARQUES,
    "tourism-lodging": LODGING,
    "tourism-guides": GUIDES,
    "tourism-transport": TRANSPORT,
    "tourism-rentacar": RENTACAR,
    "history-ancient": HISTORY_ANCIENT,
    "history-colonial": HISTORY_COLONIAL,
    "history-modern": HISTORY_MODERN,
    "music-artists": ARTISTS,
    "music-genres": GENRES,
    "music-evolution": EVOLUTION,
    "gastronomy-restaurants": RESTAURANTS,
    "services-banks": BANKS,
    "services-commerce": COMMERCE,
    "services-fuel": FUEL,
    "services-emergency": EMERGENCY,
    "services-schools": SCHOOLS,
    "services-comms": COMMS,
    "blog-creators": CREATORS,
    "tourism-routes": ROTEIROS,
    "services-documents": DOCUMENTOS,
    "services-health": SAUDE,
    "services-education": EDUCACAO,
    "services-taxes": IMPOSTOS,
    "entertainment-cinema": CINEMA,
    "entertainment-events": EVENTOS,
    "entertainment-sports": DESPORTO,
    "entertainment-games": JOGOS,
    "blog-news": NOTICIAS,
    "blog-culture": CULTURA,
    "blog-travel": VIAGENS,
    "blog-opinion": OPINIAO,
    "gastronomy-recipes": RECIPES,
    "gastronomy-drinks": BEBIDAS,
    "gastronomy-seafood": MARISCOS,
};

/**
 * First content of the Home page (Breve História, Serviços Públicos, Emergências, Entretenimento):
 * these entries start with "Mostrar na Home" switched on. From then on it is managed in the BackOffice.
 */
export const HOME_DEFAULTS: Record<string, string[]> = {
    "history-ancient": ["primeiros-povos", "reino-do-mutapa"],
    "history-colonial": ["chegada-dos-portugueses", "companhias-majestaticas"],
    "history-modern": ["luta-armada", "independencia-1975"],
    "services-documents": ["bilhete-de-identidade", "passaporte"],
    "services-health": ["unidades-sanitarias", "vacinacao"],
    "services-education": ["matriculas", "calendario-escolar"],
    "services-taxes": ["nuit", "e-tributacao"],
    "services-emergency": ["bombeiros", "policia", "ambulancia", "linha-fala-crianca"],
    "entertainment-cinema": ["kuxa-kanema"],
    "entertainment-events": ["azgo"],
    "entertainment-sports": ["futebol"],
    "entertainment-games": ["hip-hop"],
};
for (const [collection, slugs] of Object.entries(HOME_DEFAULTS)) {
    SEEDS[collection] = (SEEDS[collection] ?? []).map((i) => (slugs.includes(i.slug) ? ({ ...i, showOnHome: true } as typeof i) : i));
}

/** "Reinos e Impérios" (Cronologia page): these ancient-history entries start with "realm" switched on. */
const REALMS = ["sofala-e-o-ouro", "cidades-suaili", "reino-do-mutapa", "reinos-maravi", "estado-de-gaza", "makua-e-macondes"];
SEEDS["history-ancient"] = (SEEDS["history-ancient"] ?? []).map((i) => (REALMS.includes(i.slug) ? ({ ...i, realm: true } as typeof i) : i));
