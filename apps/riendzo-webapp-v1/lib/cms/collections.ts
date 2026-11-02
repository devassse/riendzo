/**
 * Definition of every content collection managed by the BackOffice.
 * Pure data (safe to import from client components).
 */
import { CATEGORIES } from "@/app/[locale]/(pages)/gastronomia/receitas/recipe-categories";

export type GroupId = "tourism" | "services" | "entertainment" | "blog" | "gastronomy";

export type CollectionKind = "catalog" | "recipe";

export type GroupDef = { id: GroupId; label: string; emoji: string; color: string; publicPath: string };

export type CollectionDef = {
    id: string;
    kind: CollectionKind;
    group: GroupId;
    label: string;
    /** What one entry is called, e.g. "praia" */
    singular: string;
    description: string;
    /** Public path without locale */
    publicPath: string;
    color: string;
};

export const GROUPS: GroupDef[] = [
    { id: "tourism", label: "Turismo", emoji: "🌴", color: "#00aefb", publicPath: "/turismo" },
    { id: "services", label: "Serviços Públicos", emoji: "🏛️", color: "#1f6fe0", publicPath: "/servicos" },
    { id: "entertainment", label: "Entretenimento", emoji: "🎬", color: "#c86b8c", publicPath: "/entretenimento" },
    { id: "blog", label: "Blog", emoji: "✍️", color: "#f0a83a", publicPath: "/blog" },
    { id: "gastronomy", label: "Gastronomia", emoji: "🍲", color: "#e5533d", publicPath: "/gastronomia" },
];

const c = (
    id: string, kind: CollectionKind, group: GroupId, label: string, singular: string,
    description: string, publicPath: string, color: string
): CollectionDef => ({ id, kind, group, label, singular, description, publicPath, color });

export const COLLECTIONS: CollectionDef[] = [
    c("tourism-beaches", "catalog", "tourism", "Praias & Ilhas", "praia ou ilha", "Destinos de mar, mergulho e descanso.", "/turismo/praias", "#00aefb"),
    c("tourism-parks", "catalog", "tourism", "Parques Nacionais", "parque", "Parques, reservas e áreas protegidas.", "/turismo/parques", "#35be12"),
    c("tourism-island", "catalog", "tourism", "Ilha de Moçambique", "ponto de interesse", "Monumentos, museus e cultura da Ilha.", "/turismo/ilha-de-mocambique", "#f0a83a"),
    c("tourism-routes", "catalog", "tourism", "Roteiros Sugeridos", "roteiro", "Itinerários dia a dia.", "/turismo/roteiros", "#e5533d"),

    c("services-documents", "catalog", "services", "Documentos & BI", "guia de documento", "Guias de documentos e registos.", "/servicos/documentos", "#00aefb"),
    c("services-health", "catalog", "services", "Saúde", "guia de saúde", "Serviços de saúde, prevenção e emergência.", "/servicos/saude", "#e5533d"),
    c("services-education", "catalog", "services", "Educação", "guia de educação", "Matrículas, ensino e bolsas.", "/servicos/educacao", "#f0a83a"),
    c("services-taxes", "catalog", "services", "Impostos & Taxas", "guia fiscal", "NUIT, impostos e obrigações.", "/servicos/impostos", "#35be12"),

    c("entertainment-cinema", "catalog", "entertainment", "Cinema & Séries", "título ou realizador", "Filmes, realizadores e festivais.", "/entretenimento/cinema", "#c86b8c"),
    c("entertainment-events", "catalog", "entertainment", "Eventos", "evento", "Festivais, feiras e celebrações.", "/entretenimento/eventos", "#f0a83a"),
    c("entertainment-sports", "catalog", "entertainment", "Desporto", "entrada de desporto", "Modalidades, lendas e locais.", "/entretenimento/desporto", "#35be12"),
    c("entertainment-games", "catalog", "entertainment", "Jogos & Cultura Pop", "entrada de cultura pop", "Jogos, moda, música urbana e gíria.", "/entretenimento/jogos", "#00aefb"),

    c("blog-news", "catalog", "blog", "Últimas Notícias", "notícia", "Notícias e explicadores.", "/blog/noticias", "#e5533d"),
    c("blog-culture", "catalog", "blog", "Cultura", "artigo de cultura", "Tradições, artes e personalidades.", "/blog/cultura", "#f0a83a"),
    c("blog-travel", "catalog", "blog", "Viagens", "artigo de viagem", "Dicas de viagem.", "/blog/viagens", "#00aefb"),
    c("blog-opinion", "catalog", "blog", "Opinião", "coluna", "Colunas e artigos de opinião.", "/blog/opiniao", "#c86b8c"),

    c("gastronomy-recipes", "recipe", "gastronomy", "Receitas Tradicionais", "receita", "Pratos tradicionais passo a passo.", "/gastronomia/receitas", "#e5533d"),
    c("gastronomy-drinks", "recipe", "gastronomy", "Bebidas Locais", "bebida", "Sumos, chás e bebidas.", "/gastronomia/bebidas", "#f0a83a"),
];

export const getCollection = (id: string) => COLLECTIONS.find((x) => x.id === id);
export const getGroup = (id: GroupId) => GROUPS.find((g) => g.id === id)!;
export const collectionsOf = (group: GroupId) => COLLECTIONS.filter((x) => x.group === group);

export const RECIPE_CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
    seafood: "Mariscos", meat: "Carnes", curry: "Caril", vegetables: "Legumes",
    sides: "Acompanhamentos", snacks: "Petiscos", sauces: "Molhos", desserts: "Sobremesas",
    drinks: "Bebidas", refreshing: "Refrescos", alcoholic: "Alcoólicas", hot: "Quentes",
};
export const RECIPE_CATEGORIES = CATEGORIES;

export const BLOCK_KINDS = [
    { value: "list", label: "Lista (pontos)" },
    { value: "steps", label: "Passo a passo (numerado)" },
    { value: "text", label: "Texto (parágrafos)" },
    { value: "tags", label: "Etiquetas" },
] as const;

export const SWATCHES = ["#00aefb", "#35be12", "#f0a83a", "#e5533d", "#c86b8c", "#1f6fe0", "#0b1220"];
