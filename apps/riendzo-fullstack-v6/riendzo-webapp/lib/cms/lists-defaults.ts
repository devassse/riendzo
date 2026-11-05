/**
 * Default values of the generic lists ("Administrador > Dados genéricos").
 * After the first edit in the BackOffice the stored version wins.
 * Pure data: safe to import anywhere.
 */
export type ListItem = { value: string; label: string; color?: string };
export type ListDef = { id: string; label: string; description: string; group: string; items: ListItem[] };

const same = (labels: string[]): ListItem[] => labels.map((l) => ({ value: l, label: l }));

export const LIST_DEFAULTS: ListDef[] = [
    {
        id: "provinces", label: "Províncias", group: "Geral",
        description: "Usadas como etiqueta (local) em Turismo, artistas, criadores, etc.",
        items: same(["Cabo Delgado", "Gaza", "Inhambane", "Manica", "Maputo", "Maputo Cidade", "Nampula", "Niassa", "Sofala", "Tete", "Zambézia", "Nacional", "Várias províncias"]),
    },
    {
        id: "music-genres", label: "Estilos musicais", group: "Música",
        description: "Estilos usados nos artistas (o valor é o endereço do estilo na página Géneros).",
        items: [
            { value: "marrabenta", label: "Marrabenta", color: "#35be12" },
            { value: "pandza", label: "Pandza", color: "#c86b8c" },
            { value: "afro-house", label: "Afro-House", color: "#00aefb" },
            { value: "hip-hop", label: "Hip-Hop", color: "#f0a83a" },
            { value: "tufo", label: "Tufo", color: "#a85bd6" },
            { value: "timbila", label: "Timbila", color: "#d98a00" },
            { value: "gospel", label: "Gospel", color: "#1f6fe0" },
            { value: "pop", label: "Pop", color: "#e5533d" },
        ],
    },
    {
        id: "recipe-categories", label: "Categorias de receitas e bebidas", group: "Gastronomia",
        description: "Tipos de prato e de bebida (Receitas e Bebidas Locais). O valor é interno; o nome é o que aparece no site.",
        items: [
            { value: "seafood", label: "Mariscos" }, { value: "meat", label: "Carnes" }, { value: "curry", label: "Caril" },
            { value: "vegetables", label: "Legumes" }, { value: "sides", label: "Acompanhamentos" }, { value: "snacks", label: "Petiscos" },
            { value: "sauces", label: "Molhos" }, { value: "desserts", label: "Sobremesas" }, { value: "drinks", label: "Bebidas" },
            { value: "refreshing", label: "Refrescos" }, { value: "alcoholic", label: "Alcoólicas" }, { value: "hot", label: "Quentes" },
        ],
    },
    {
        id: "lodging-types", label: "Tipos de alojamento", group: "Turismo",
        description: "Hotel, guest house, lodge…",
        items: same(["Hotel", "Guest house", "Lodge", "Resort", "Pousada", "Apartamento", "Campismo"]),
    },
    {
        id: "guide-specialties", label: "Especialidades dos guias", group: "Turismo",
        description: "Áreas em que o guia trabalha.",
        items: same(["Safári", "Mergulho", "Cultura e história", "Aventura", "Gastronomia", "Observação de aves", "Pesca desportiva", "Caminhadas", "Fotografia"]),
    },
    {
        id: "transport-types", label: "Tipos de transporte e operadores", group: "Turismo",
        description: "Voos, autocarros, ferries, aluguer de viaturas, operadores turísticos…",
        items: same(["Voos", "Autocarros e chapas", "Barcos e ferries", "Aluguer de viaturas", "Táxis e transfers", "Operador turístico", "Agência de viagens"]),
    },
    {
        id: "creator-areas", label: "Áreas dos criadores de conteúdo", group: "Blog",
        description: "Culinária, turismo, música…",
        items: same(["Culinária", "Turismo e viagens", "Música", "Humor", "Cultura e história", "Desporto", "Educação", "Tecnologia"]),
    },
    {
        id: "decades", label: "Épocas / décadas", group: "Música e História",
        description: "Usadas na linha do tempo da Evolução Musical.",
        items: same(["Raízes", "Anos 1950-60", "Anos 1970", "Anos 1980", "Anos 1990", "Anos 2000", "Anos 2010", "Hoje"]),
    },
    {
        id: "eras", label: "Períodos históricos", group: "História",
        description: "Etiquetas dos marcos históricos.",
        items: same(["Pré-história", "Séculos I-XV", "Séculos XV-XIX", "1498-1900", "1900-1964", "1964-1975", "1975-1992", "1992-hoje"]),
    },
];

LIST_DEFAULTS.push(
    { id: "cuisines", label: "Tipos de cozinha", group: "Gastronomia", description: "Categorias dos restaurantes.", items: same(["Moçambicana", "Marisqueira", "Frango piri-piri", "Portuguesa", "Italiana e pizzaria", "Indiana", "Fast food", "Café e pastelaria", "Churrasqueira", "Internacional"]) },
    { id: "rental-types", label: "Tipos de aluguer de viaturas", group: "Turismo", description: "Rent-a-car.", items: same(["Sem motorista", "Com motorista", "4x4 e safári", "Transfer de aeroporto", "Longa duração"]) },
    { id: "bank-types", label: "Tipos de instituição financeira", group: "Serviços", description: "Bancos e afins.", items: same(["Banco comercial", "Banco de investimento", "Microfinanças", "Casa de câmbio", "Seguros", "Dinheiro móvel"]) },
    { id: "shop-types", label: "Tipos de comércio", group: "Serviços", description: "Mercados, supermercados e lojas.", items: same(["Mercado municipal", "Supermercado", "Loja de conveniência", "Loja de roupa", "Eletrónica", "Material de construção", "Farmácia", "Artesanato"]) },
    { id: "fuel-services", label: "Serviços das bombas", group: "Serviços", description: "Combustíveis e serviços.", items: same(["Gasolina", "Gasóleo", "GPL", "Lavagem", "Loja de conveniência", "Pneus e calibragem", "Multibanco"]) },
    { id: "emergency-types", label: "Tipos de emergência", group: "Serviços", description: "Bombeiros, polícia, ambulâncias…", items: same(["Bombeiros", "Polícia", "Ambulância e urgência", "Proteção civil", "Linha de apoio"]) },
    { id: "school-types", label: "Tipos de escola e centro", group: "Serviços", description: "Escolas, universidades, bibliotecas…", items: same(["Escola primária", "Escola secundária", "Instituto técnico", "Universidade", "Biblioteca", "Centro literário e cultural"]) },
    { id: "general-service-types", label: "Tipos de serviço geral", group: "Serviços", description: "Canalização, eletricidade, limpeza, mecânica…", items: same(["Canalização", "Eletricidade", "Limpeza", "Mecânica auto", "Construção e obras", "Carpintaria", "Serralharia", "Pintura", "Jardinagem", "Informática e telecomunicações", "Mudanças e transportes", "Lavandaria", "Costura e alfaiataria", "Beleza e bem-estar", "Outros"]) },
    { id: "comm-types", label: "Tipos de comunicação", group: "Serviços", description: "Telefonia, televisão e rádio.", items: same(["Operadora móvel", "Internet", "Televisão", "Rádio"]) },
);

export const LIST_IDS = LIST_DEFAULTS.map((l) => l.id);
