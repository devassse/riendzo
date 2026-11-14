/**
 * Definition of every content collection managed by the BackOffice.
 * Pure data (safe to import from client components).
 */
export type GroupId = "history" | "music" | "gastronomy" | "tourism" | "services" | "entertainment" | "blog";

export type CollectionKind = "catalog" | "recipe" | "artist";

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
    /** List that feeds the "tag" select (default: generated from the existing content) */
    tagList?: string;
    /** List that feeds the "categories" multi-select (default: generated from the existing content) */
    categoryList?: string;
    /** Show the contact block (phone, WhatsApp, e-mail…) in the editor */
    contact?: boolean;
    /** Allow paid/highlighted listings (shown first, "Patrocinado") */
    featured?: boolean;
    /** Label for the tag field, e.g. "Província" */
    tagLabel?: string;
    /**
     * "Establishment" collections (restaurants, hotels, banks…): every entry gets
     * its own page (/…/<slug>), hours, coordinates, QR code and can be managed
     * by its owner.
     */
    directory?: boolean;
    /** The page can publish posts ("aventuras": text, photo gallery and YouTube videos), e.g. guides and creators */
    posts?: boolean;
    /** What the posts are called: "Aventuras", "Publicações"… */
    postsLabel?: string;
    /** What the offers are called in the editor: menu, rooms, vehicles, products… */
    offers?: { group: string; item: string; title: string };
};

/** Same order as the public navbar. */
export const GROUPS: GroupDef[] = [
    { id: "history", label: "História", emoji: "📜", color: "#a8483a", publicPath: "/historia" },
    { id: "music", label: "Música", emoji: "🎵", color: "#35be12", publicPath: "/musica" },
    { id: "gastronomy", label: "Gastronomia", emoji: "🍲", color: "#e5533d", publicPath: "/gastronomia" },
    { id: "tourism", label: "Turismo", emoji: "🌴", color: "#0370d6", publicPath: "/turismo" },
    { id: "services", label: "Serviços Públicos", emoji: "🏛️", color: "#1f6fe0", publicPath: "/servicos" },
    { id: "entertainment", label: "Entretenimento", emoji: "🎬", color: "#a85bd6", publicPath: "/entretenimento" },
    { id: "blog", label: "Blog", emoji: "✍️", color: "#d98a00", publicPath: "/blog" },
];

const c = (
    id: string, kind: CollectionKind, group: GroupId, label: string, singular: string,
    description: string, publicPath: string, color: string, extra: Partial<CollectionDef> = {}
): CollectionDef => ({ id, kind, group, label, singular, description, publicPath, color, ...extra });

const PROV = { tagList: "provinces", tagLabel: "Província" } as const;
const DIR = { directory: true, contact: true, featured: true, tagList: "provinces", tagLabel: "Província" } as const;

export const COLLECTIONS: CollectionDef[] = [
    c("history-ancient", "catalog", "history", "Reinos e Impérios", "marco histórico", "Povos, reinos, línguas e rotas comerciais antes da ocupação portuguesa.", "/historia/antiga", "#00aefb", { tagList: "eras", tagLabel: "Período" }),
    c("history-colonial", "catalog", "history", "Período Colonial", "marco histórico", "Da chegada dos portugueses à luta pela independência.", "/historia/colonial", "#a8483a", { tagList: "eras", tagLabel: "Período" }),
    c("history-modern", "catalog", "history", "Moçambique Moderno", "marco histórico", "Independência, guerra, paz, democracia, províncias e população.", "/historia/moderna", "#35be12", { tagList: "eras", tagLabel: "Período" }),

    c("music-artists", "artist", "music", "Artistas Moçambicanos", "artista", "Perfis, biografia, discografia e álbuns de fotografias.", "/musica/artistas", "#35be12"),
    c("music-genres", "catalog", "music", "Géneros Musicais", "género", "Marrabenta, Pandza, Timbila e outros estilos.", "/musica/generos", "#c86b8c"),
    c("music-evolution", "catalog", "music", "Evolução Musical", "momento da linha do tempo", "A linha do tempo da música moçambicana.", "/musica/evolucao", "#f0a83a", { tagList: "decades", tagLabel: "Época" }),

    c("gastronomy-recipes", "recipe", "gastronomy", "Receitas Tradicionais", "receita", "Pratos tradicionais passo a passo.", "/gastronomia/receitas", "#e5533d"),
    c("gastronomy-seafood", "recipe", "gastronomy", "Frutos do Mar", "prato", "Camarão, caranguejo, lagosta e peixe: receitas da costa.", "/gastronomia/mariscos", "#00aefb"),
    c("gastronomy-restaurants", "catalog", "gastronomy", "Restaurantes", "restaurante", "Restaurantes com menu, preços, horários e página própria.", "/gastronomia/restaurantes", "#d98a00", { ...DIR, categoryList: "cuisines", offers: { group: "Secção do menu", item: "Prato", title: "Menu" } }),
    c("gastronomy-drinks", "recipe", "gastronomy", "Bebidas Locais", "bebida", "Sumos, chás e bebidas.", "/gastronomia/bebidas", "#f0a83a"),

    c("tourism-beaches", "catalog", "tourism", "Praias & Ilhas", "praia ou ilha", "Destinos de mar, mergulho e descanso.", "/turismo/praias", "#00aefb", PROV),
    c("tourism-parks", "catalog", "tourism", "Parques Nacionais", "parque", "Parques, reservas e áreas protegidas.", "/turismo/parques", "#35be12", PROV),
    c("tourism-lodging", "catalog", "tourism", "Alojamentos", "alojamento", "Hotéis, guest houses e lodges: quartos, fotografias e preços.", "/turismo/alojamentos", "#f0a83a", { ...DIR, categoryList: "lodging-types", offers: { group: "Tipo de quarto", item: "Quarto", title: "Quartos e preços" } }),
    c("tourism-guides", "catalog", "tourism", "Guias Turísticos", "guia", "Guias registados, contactáveis por telefone e WhatsApp.", "/turismo/guias", "#c86b8c", { ...DIR, posts: true, postsLabel: "Aventuras", categoryList: "guide-specialties", offers: { group: "Tipo de serviço", item: "Passeio ou pacote", title: "Passeios e pacotes" } }),
    c("tourism-transport", "catalog", "tourism", "Transportes & Operadores", "operador", "Voos, autocarros, ferries e operadores turísticos.", "/turismo/transportes", "#1f6fe0", { ...DIR, categoryList: "transport-types", offers: { group: "Tipo de serviço", item: "Serviço", title: "Serviços e tarifas" } }),
    c("tourism-rentacar", "catalog", "tourism", "Rent-a-car", "empresa de aluguer", "Aluguer de viaturas: frota, fotografias, condições e preços.", "/turismo/rent-a-car", "#e5533d", { ...DIR, categoryList: "rental-types", offers: { group: "Categoria", item: "Viatura", title: "Viaturas e preços" } }),
    c("tourism-routes", "catalog", "tourism", "Roteiros Sugeridos", "roteiro", "Itinerários dia a dia.", "/turismo/roteiros", "#e5533d", PROV),

    c("services-documents", "catalog", "services", "Documentos & BI", "guia de documento", "Guias de documentos e registos.", "/servicos/documentos", "#00aefb"),
    c("services-health", "catalog", "services", "Saúde", "guia de saúde", "Serviços de saúde, prevenção e emergência.", "/servicos/saude", "#e5533d"),
    c("services-education", "catalog", "services", "Educação", "guia de educação", "Matrículas, ensino e bolsas.", "/servicos/educacao", "#f0a83a"),
    c("services-taxes", "catalog", "services", "Impostos & Taxas", "guia fiscal", "NUIT, impostos e obrigações.", "/servicos/impostos", "#35be12"),
    c("services-banks", "catalog", "services", "Bancos", "banco", "Bancos, balcões, horários e como chegar.", "/servicos/bancos", "#1f6fe0", { ...DIR, categoryList: "bank-types", offers: { group: "Tipo de serviço", item: "Serviço", title: "Serviços e tarifas" } }),
    c("services-commerce", "catalog", "services", "Mercados, Supermercados & Lojas", "estabelecimento comercial", "Onde comprar: mercados, supermercados e lojas com produtos e preços.", "/servicos/comercio", "#2f9e44", { ...DIR, categoryList: "shop-types", offers: { group: "Secção", item: "Produto", title: "Produtos e preços" } }),
    c("services-fuel", "catalog", "services", "Bombas de Combustível", "bomba", "Postos de abastecimento, horários e localização.", "/servicos/combustivel", "#d98a00", { ...DIR, categoryList: "fuel-services", offers: { group: "Tipo", item: "Combustível ou serviço", title: "Combustíveis e serviços" } }),
    c("services-emergency", "catalog", "services", "Emergências", "serviço de emergência", "Bombeiros, polícia, ambulâncias e linhas de apoio.", "/servicos/emergencias", "#e5533d", { ...DIR, categoryList: "emergency-types" }),
    c("services-schools", "catalog", "services", "Escolas & Centros Literários", "escola ou centro", "Escolas, universidades, bibliotecas e centros culturais: onde ficam e horários.", "/servicos/escolas", "#a85bd6", { ...DIR, categoryList: "school-types", offers: { group: "Curso ou nível", item: "Curso", title: "Cursos e propinas" } }),
    c("services-comms", "catalog", "services", "Telefonia, TV & Rádio", "operadora ou meio", "Operadoras de telefonia, televisões e rádios nacionais.", "/servicos/comunicacoes", "#00aefb", { ...DIR, categoryList: "comm-types", offers: { group: "Tipo", item: "Plano ou programa", title: "Planos e programas" } }),
    c("services-general", "catalog", "services", "Serviços Gerais", "serviço", "Canalizadores, eletricistas, mecânicos, limpeza, construção e outros profissionais do dia a dia.", "/servicos/gerais", "#5b7fa6", { ...DIR, categoryList: "general-service-types", offers: { group: "Tipo de serviço", item: "Serviço", title: "Serviços e preços" } }),

    c("entertainment-cinema", "catalog", "entertainment", "Cinema & Séries", "título ou realizador", "Filmes, realizadores e festivais.", "/entretenimento/cinema", "#c86b8c"),
    c("entertainment-events", "catalog", "entertainment", "Eventos", "evento", "Festivais, feiras e celebrações.", "/entretenimento/eventos", "#f0a83a", { contact: true }),
    c("entertainment-sports", "catalog", "entertainment", "Desporto", "entrada de desporto", "Modalidades, lendas e locais.", "/entretenimento/desporto", "#35be12"),
    c("entertainment-games", "catalog", "entertainment", "Jogos & Cultura Pop", "entrada de cultura pop", "Jogos, moda, música urbana e gíria.", "/entretenimento/jogos", "#00aefb"),

    c("blog-news", "catalog", "blog", "Últimas Notícias", "notícia", "Notícias e explicadores.", "/blog/noticias", "#e5533d"),
    c("blog-culture", "catalog", "blog", "Cultura", "artigo de cultura", "Tradições, artes e personalidades.", "/blog/cultura", "#f0a83a"),
    c("blog-travel", "catalog", "blog", "Viagens", "artigo de viagem", "Dicas de viagem.", "/blog/viagens", "#00aefb"),
    c("blog-opinion", "catalog", "blog", "Opinião", "coluna", "Colunas e artigos de opinião.", "/blog/opiniao", "#c86b8c"),
    c("blog-creators", "catalog", "blog", "Criadores de Conteúdo", "criador", "Criadores nacionais: culinária, viagens, música e mais.", "/blog/criadores", "#a85bd6", { ...PROV, directory: true, featured: true, posts: true, postsLabel: "Publicações", categoryList: "creator-areas", contact: true }),
];

export const getCollection = (id: string) => COLLECTIONS.find((x) => x.id === id);
export const getGroup = (id: GroupId) => GROUPS.find((g) => g.id === id)!;
export const collectionsOf = (group: GroupId) => COLLECTIONS.filter((x) => x.group === group);

export const BLOCK_KINDS = [
    { value: "list", label: "Lista (pontos)" },
    { value: "steps", label: "Passo a passo (numerado)" },
    { value: "text", label: "Texto (parágrafos)" },
    { value: "tags", label: "Etiquetas" },
] as const;

export const SWATCHES = ["#00aefb", "#35be12", "#f0a83a", "#e5533d", "#c86b8c", "#1f6fe0", "#a85bd6", "#0b1220"];

/** Collections whose entries have their own page (/…/<slug>). */
export const DIRECTORY_COLLECTIONS = COLLECTIONS.filter((x) => x.directory);
export const isDirectory = (id: string) => Boolean(getCollection(id)?.directory);

/** Public URL of an entry (without locale). */
/**
 * Same content inside the member portal (no trip to the public site):
 * establishments and artists have their own portal page, the rest opens its side panel (?item=).
 */
export function portalUrlOf(collectionId: string, slug: string) {
    const c = getCollection(collectionId);
    if (!c) return "/conta";
    if (c.directory || c.kind === "artist") return `/conta/explorar/${c.id}/${slug}`;
    return `/conta/explorar/${c.id}?item=${slug}`;
}

export function publicUrlOf(collectionId: string, slug: string) {
    const c = getCollection(collectionId);
    if (!c) return "/";
    if (c.directory || c.kind === "artist") return `${c.publicPath}/${slug}`;
    return `${c.publicPath}?item=${slug}`;
}
