/**
 * Initial content for every collection: the data that used to be hard-coded
 * in the pages. A collection is seeded from here the first time it is read;
 * after the first save in the BackOffice the JSON file takes over.
 */
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import type { Recipe } from "@/app/[locale]/(pages)/gastronomia/receitas/recipes-grid";
import { PRAIAS } from "@/app/[locale]/(pages)/turismo/praias/praias";
import { PARQUES } from "@/app/[locale]/(pages)/turismo/parques/parques";
import { ILHA } from "@/app/[locale]/(pages)/turismo/ilha-de-mocambique/ilha";
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
import { BEBIDAS } from "@/app/[locale]/(pages)/gastronomia/bebidas/bebidas-data";

export const SEEDS: Record<string, (CatalogItem | Recipe)[]> = {
    "tourism-beaches": PRAIAS,
    "tourism-parks": PARQUES,
    "tourism-island": ILHA,
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
};
