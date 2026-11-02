import { ALL, WEEKDAYS, entry, html, week } from "./h";

/**
 * IMPORTANT: entries starting with "Exemplo ·" are demonstration data (fictional
 * businesses, prices and phone numbers). Delete or replace them in the BackOffice
 * before launch. Real institutions below have no phone/address/hours until filled in.
 */
const fakeContact = { phone: "+258 84 000 0000", whatsapp: "258840000000", email: "exemplo@riendzo.co.mz" };

export const RESTAURANTS = [
    entry({
        slug: "exemplo-mar-e-sol", title: "Exemplo · Restaurante Mar & Sol", tag: "Maputo Cidade", categories: ["Marisqueira", "Moçambicana"], color: "#d98a00", emoji: "🦐",
        summary: "Exemplo de página de restaurante: marisco fresco, matapa e vista para a baía.",
        body: html("Este é um restaurante fictício para mostrar como a página funciona: informação, horário, mapa, menu com preços e fotografias dos pratos.", "O proprietário pode gerir o próprio menu depois de iniciar sessão no BackOffice."),
        contact: { ...fakeContact, address: "Av. Exemplo, Maputo" }, location: { lat: -25.9692, lng: 32.5732 },
        hours: { ...week([["11:00", "15:00"], ["18:00", "23:00"]], ["mon", "tue", "wed", "thu"]), ...week([["11:00", "23:30"]], ["fri", "sat", "sun"]) },
        offers: [
            { title: "Entradas", items: [
                { name: "Rissóis de camarão", description: "Seis unidades, com molho de piri-piri.", tags: ["Camarão", "Farinha", "Piri-piri"], price: 250 },
                { name: "Caril de amêijoa", tags: ["Amêijoa", "Coco", "Alho"], price: 320 },
            ] },
            { title: "Pratos principais", items: [
                { name: "Matapa com caranguejo", description: "Folhas de mandioca piladas com coco e amendoim, e caranguejo.", tags: ["Mandioca", "Coco", "Amendoim", "Caranguejo"], price: 480 },
                { name: "Camarão tigre grelhado", description: "Camarão grande grelhado com manteiga de alho, arroz e salada.", tags: ["Camarão", "Alho", "Arroz"], price: 1250 },
                { name: "Frango à zambeziana", tags: ["Frango", "Coco", "Limão", "Piri-piri"], price: 560 },
            ] },
            { title: "Sobremesas e bebidas", items: [
                { name: "Pudim de coco", price: 180 },
                { name: "Sumo de maracujá", price: 90, priceNote: "copo" },
                { name: "Cerveja 2M", price: 110, priceNote: "garrafa", available: false },
            ] },
        ],
        featured: true,
    }),
    entry({
        slug: "exemplo-sabor-de-casa", title: "Exemplo · Sabor de Casa", tag: "Maputo Cidade", categories: ["Moçambicana", "Café e pastelaria"], color: "#e5533d", emoji: "🍲",
        summary: "Exemplo: cozinha caseira moçambicana ao almoço.", contact: fakeContact, location: { lat: -25.9553, lng: 32.5886 },
        hours: week([["07:00", "17:00"]], ["mon", "tue", "wed", "thu", "fri", "sat"]),
        offers: [{ title: "Prato do dia", items: [
            { name: "Xima com galinha à cafreal", tags: ["Milho", "Galinha", "Piri-piri"], price: 350 },
            { name: "Feijão-nhemba com coco", tags: ["Feijão", "Coco"], price: 220 },
        ] }],
    }),
];

export const LODGING = [
    entry({
        slug: "exemplo-guest-house-tofo", title: "Exemplo · Guest House Tofo Beach", tag: "Inhambane", categories: ["Guest house"], color: "#f0a83a", emoji: "🏖️",
        summary: "Exemplo de alojamento: quartos com vista para o mar, perto da praia do Tofo.",
        body: html("Alojamento fictício para demonstrar a página: tipos de quarto, fotografias, preços e contactos com botão de WhatsApp."),
        contact: { ...fakeContact, address: "Praia do Tofo, Inhambane" }, location: { lat: -23.8566, lng: 35.5465 },
        hours: { open24h: true, note: "Check-in a partir das 14:00; check-out até às 11:00." },
        offers: [{ title: "Quartos", items: [
            { name: "Quarto duplo standard", description: "Cama de casal, ventoinha, casa de banho privativa.", tags: ["2 pessoas", "Casa de banho privativa", "Wi-Fi"], price: 2800, priceNote: "por noite" },
            { name: "Quarto família", description: "Duas camas de casal e varanda.", tags: ["4 pessoas", "Varanda", "Pequeno-almoço incluído"], price: 4800, priceNote: "por noite" },
            { name: "Dormitório partilhado", tags: ["Cama individual", "Cozinha partilhada"], price: 900, priceNote: "por pessoa/noite" },
        ] }], featured: true,
    }),
    entry({ slug: "exemplo-lodge-gorongosa", title: "Exemplo · Lodge do Parque", tag: "Sofala", categories: ["Lodge"], color: "#35be12", emoji: "🛖", summary: "Exemplo: lodge junto a um parque, com safaris incluídos.", contact: fakeContact, location: { lat: -18.9962, lng: 34.3625 }, hours: { open24h: true },
        offers: [{ title: "Quartos", items: [{ name: "Tenda de luxo", tags: ["2 pessoas", "Safári incluído"], price: 190, priceNote: "por noite" }] }], currency: "USD" }),
];

export const GUIDES = [
    entry({ slug: "exemplo-guia-ana", title: "Exemplo · Guia Ana M.", tag: "Maputo Cidade", categories: ["Cultura e história", "Gastronomia"], color: "#c86b8c", emoji: "🧭",
        summary: "Exemplo: guia de cultura e gastronomia de Maputo (Português, Inglês, Changana).", contact: fakeContact,
        facts: [{ label: "Línguas", value: "Português, Inglês, Changana" }, { label: "Experiência", value: "8 anos" }],
        offers: [{ title: "Passeios", items: [{ name: "Maputo a pé: história e arte", description: "3 horas na Baixa, com paragem para café.", price: 1500, priceNote: "por pessoa" }, { name: "Sabores de Maputo", description: "Mercado, petiscos e almoço tradicional.", price: 2200, priceNote: "por pessoa" }] }] }),
    entry({ slug: "exemplo-guia-ernesto", title: "Exemplo · Guia Ernesto C.", tag: "Sofala", categories: ["Safári", "Observação de aves"], color: "#35be12", emoji: "🦜",
        summary: "Exemplo: guia de safári e aves na região da Gorongosa.", contact: fakeContact,
        facts: [{ label: "Línguas", value: "Português, Inglês, Cindau" }] }),
];

export const TRANSPORT = [
    entry({ slug: "lam", title: "LAM · Linhas Aéreas de Moçambique", tag: "Nacional", categories: ["Voos"], color: "#1f6fe0", emoji: "✈️",
        summary: "A companhia aérea nacional, com voos domésticos e regionais.", body: html("Consulte horários, tarifas e condições diretamente com a companhia.") }),
    entry({ slug: "exemplo-ferry-catembe", title: "Exemplo · Ferry Maputo-Catembe", tag: "Maputo Cidade", categories: ["Barcos e ferries"], color: "#00aefb", emoji: "⛴️",
        summary: "Exemplo de operador de ferry entre o centro de Maputo e a Catembe.", contact: fakeContact, hours: week([["05:30", "21:00"]], [...ALL]),
        offers: [{ title: "Tarifas", items: [{ name: "Passageiro", price: 15, priceNote: "por viagem" }, { name: "Viatura ligeira", price: 150, priceNote: "por viagem" }] }] }),
    entry({ slug: "exemplo-operador-safari", title: "Exemplo · Operador Safari Sul", tag: "Maputo Cidade", categories: ["Operador turístico"], color: "#f0a83a", emoji: "🚙",
        summary: "Exemplo de operador turístico com passeios organizados.", contact: fakeContact }),
];

export const RENTACAR = [
    entry({ slug: "exemplo-rent-sul", title: "Exemplo · Rent-a-Car Sul", tag: "Maputo Cidade", categories: ["Sem motorista", "Transfer de aeroporto"], color: "#e5533d", emoji: "🚗",
        summary: "Exemplo: aluguer de viaturas económicas e 4x4 em Maputo.",
        body: html("Empresa fictícia para demonstrar a página: frota com fotografias, preços e condições de aluguer."),
        contact: { ...fakeContact, address: "Aeroporto Internacional de Maputo" }, location: { lat: -25.9209, lng: 32.5726 }, hours: week([["07:00", "19:00"]], [...ALL]), featured: true,
        facts: [{ label: "Idade mínima", value: "23 anos" }, { label: "Carta de condução", value: "Pelo menos 2 anos" }, { label: "Caução", value: "Cartão de crédito ou depósito" }],
        blocks: [{ kind: "list", heading: "Condições de aluguer", items: ["Carta de condução válida", "Passaporte ou BI", "Caução na entrega", "Quilometragem limitada nos pacotes económicos", "Seguro básico incluído"] }],
        offers: [{ title: "Económicos", items: [{ name: "Toyota Starlet (ou similar)", tags: ["5 lugares", "Manual", "Ar condicionado"], price: 2500, priceNote: "por dia" }] }, { title: "4x4 e pickups", items: [{ name: "Toyota Hilux 4x4", tags: ["5 lugares", "Manual", "4x4", "Diesel"], price: 7500, priceNote: "por dia" }] }] }),
    entry({ slug: "exemplo-rent-norte", title: "Exemplo · Rent-a-Car Norte", tag: "Nampula", categories: ["Com motorista"], color: "#1f6fe0", emoji: "🚙", summary: "Exemplo: viaturas com motorista para o norte.", contact: fakeContact }),
];

const real = (slug: string, title: string, categories: string[], emoji: string, summary: string, color = "#1f6fe0") =>
    entry({ slug, title, tag: "Nacional", categories, color, emoji, summary });

export const BANKS = [
    real("bci", "BCI · Banco Comercial e de Investimentos", ["Banco comercial"], "🏦", "Banco comercial com balcões em todo o país. Complete os balcões, horários e contactos."),
    real("millennium-bim", "Millennium bim", ["Banco comercial"], "🏦", "Banco comercial com rede de balcões e caixas automáticos."),
    real("standard-bank", "Standard Bank Moçambique", ["Banco comercial"], "🏦", "Banco comercial com presença nacional."),
    real("absa-mocambique", "Absa Bank Moçambique", ["Banco comercial"], "🏦", "Banco comercial com presença nacional."),
    real("moza-banco", "Moza Banco", ["Banco comercial"], "🏦", "Banco comercial moçambicano."),
    real("bni", "BNI · Banco Nacional de Investimento", ["Banco de investimento"], "🏦", "Instituição financeira de desenvolvimento."),
];

export const COMMERCE = [
    entry({ slug: "mercado-central-maputo", title: "Mercado Central de Maputo", tag: "Maputo Cidade", categories: ["Mercado municipal"], color: "#2f9e44", emoji: "🧺", summary: "O mercado histórico da Baixa: fruta, peixe, especiarias e artesanato. Complete o horário e a localização exata.", location: { lat: -25.9738, lng: 32.5723 } }),
    entry({ slug: "mercado-do-peixe", title: "Mercado do Peixe", tag: "Maputo Cidade", categories: ["Mercado municipal"], color: "#00aefb", emoji: "🐟", summary: "Peixe e marisco fresco, com restaurantes ao lado que preparam o que comprar." }),
    entry({ slug: "shoprite", title: "Shoprite", tag: "Nacional", categories: ["Supermercado"], color: "#e5533d", emoji: "🛒", summary: "Cadeia de supermercados com lojas nas principais cidades." }),
    entry({ slug: "spar", title: "Spar", tag: "Nacional", categories: ["Supermercado"], color: "#2f9e44", emoji: "🛒", summary: "Cadeia de supermercados com lojas em várias cidades." }),
];

export const FUEL = [
    real("petromoc", "Petromoc", ["Gasolina", "Gasóleo"], "⛽", "Empresa nacional de petróleos, com postos de abastecimento em todo o país.", "#d98a00"),
    real("galp", "Galp Moçambique", ["Gasolina", "Gasóleo", "Loja de conveniência"], "⛽", "Rede de postos com lojas de conveniência.", "#d98a00"),
    real("totalenergies", "TotalEnergies", ["Gasolina", "Gasóleo"], "⛽", "Rede internacional de postos de abastecimento.", "#d98a00"),
    real("engen", "Engen", ["Gasolina", "Gasóleo", "Loja de conveniência"], "⛽", "Rede de postos de abastecimento.", "#d98a00"),
    real("puma-energy", "Puma Energy", ["Gasolina", "Gasóleo"], "⛽", "Rede de postos de abastecimento.", "#d98a00"),
];

const emergency = (slug: string, title: string, cat: string, emoji: string, number: string, summary: string) =>
    entry({ slug, title, tag: "Nacional", categories: [cat], color: "#e5533d", emoji, summary, contact: { phone: number }, hours: { open24h: true },
        facts: [{ label: "Número", value: number }, { label: "Atendimento", value: "24 horas" }], tip: "Os números podem variar por zona ou operadora. Confirme nos canais oficiais.", tipLabel: "Atenção" });

export const EMERGENCY = [
    emergency("bombeiros", "Bombeiros", "Bombeiros", "🚒", "197", "Incêndios, resgates e acidentes. Ligue 197."),
    emergency("policia", "Polícia (PRM)", "Polícia", "🚓", "119", "Polícia da República de Moçambique. Ligue 119."),
    emergency("ambulancia", "Ambulância e urgência (INEM)", "Ambulância e urgência", "🚑", "117", "Emergências médicas e transporte de doentes. Ligue 117."),
    emergency("linha-fala-crianca", "Linha Fala Criança", "Linha de apoio", "🧒", "116", "Linha de apoio para crianças e adolescentes. Ligue 116."),
];

const sch = (slug: string, title: string, cat: string, tag: string, emoji: string, summary: string) =>
    entry({ slug, title, tag, categories: [cat], color: "#a85bd6", emoji, summary });
export const SCHOOLS = [
    sch("uem", "Universidade Eduardo Mondlane (UEM)", "Universidade", "Maputo Cidade", "🎓", "A mais antiga universidade do país, fundada em 1962. Complete o endereço, cursos e horários."),
    sch("up", "Universidade Pedagógica", "Universidade", "Maputo Cidade", "🎓", "Universidade pública com delegações em várias províncias."),
    sch("unilurio", "UniLúrio", "Universidade", "Nampula", "🎓", "Universidade pública do norte do país."),
    sch("biblioteca-nacional", "Biblioteca Nacional de Moçambique", "Biblioteca", "Maputo Cidade", "📚", "Biblioteca pública nacional, em Maputo."),
    sch("centro-franco-mocambicano", "Centro Cultural Franco-Moçambicano", "Centro literário e cultural", "Maputo Cidade", "🎭", "Espaço de exposições, espetáculos, cinema e biblioteca em Maputo."),
    sch("camoes-maputo", "Camões · Centro Cultural Português", "Centro literário e cultural", "Maputo Cidade", "📖", "Centro cultural com biblioteca, cursos e atividades."),
];

const com = (slug: string, title: string, cat: string, emoji: string, summary: string) =>
    entry({ slug, title, tag: "Nacional", categories: [cat], color: "#00aefb", emoji, summary });
export const COMMS = [
    com("vodacom", "Vodacom Moçambique", "Operadora móvel", "📶", "Operadora móvel nacional, com serviço de dinheiro móvel M-Pesa."),
    com("movitel", "Movitel", "Operadora móvel", "📶", "Operadora móvel nacional com ampla cobertura rural."),
    com("tmcel", "Tmcel", "Operadora móvel", "📶", "Operadora móvel nacional, com serviço mKesh."),
    com("tvm", "TVM · Televisão de Moçambique", "Televisão", "📺", "Televisão pública nacional."),
    com("stv", "STV", "Televisão", "📺", "Canal de televisão privado."),
    com("tv-miramar", "TV Miramar", "Televisão", "📺", "Canal de televisão privado."),
    com("radio-mocambique", "Rádio Moçambique", "Rádio", "📻", "Rádio pública nacional, com emissões em português e em línguas nacionais."),
];

export const CREATORS = [
    entry({ slug: "exemplo-sabores-de-casa", title: "Exemplo · Sabores de Casa", tag: "Maputo Cidade", categories: ["Culinária"], color: "#e5533d", emoji: "👩‍🍳", summary: "Exemplo de canal de culinária moçambicana: receitas tradicionais passo a passo.", contact: { ...fakeContact, website: "https://www.youtube.com" },
        videos: [{ title: "Matapa tradicional (exemplo)", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", creator: "Exemplo · Sabores de Casa" }] }),
    entry({ slug: "exemplo-viajar-mocambique", title: "Exemplo · Viajar Moçambique", tag: "Inhambane", categories: ["Turismo e viagens"], color: "#00aefb", emoji: "🎥", summary: "Exemplo de criador de vídeos de viagem: praias, parques e dicas.", contact: fakeContact }),
    entry({ slug: "exemplo-musica-do-bairro", title: "Exemplo · Música do Bairro", tag: "Maputo Cidade", categories: ["Música"], color: "#a85bd6", emoji: "🎧", summary: "Exemplo de canal sobre música urbana e artistas emergentes.", contact: fakeContact }),
];
