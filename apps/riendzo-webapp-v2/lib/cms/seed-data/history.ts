import { entry, html } from "./h";

/** História: Reinos e Impérios (antes da ocupação portuguesa). */
export const HISTORY_ANCIENT = [
    entry({
        slug: "povos-e-linguas", title: "Povos e línguas de Moçambique", tag: "Séculos I-XV", categories: ["Povos e línguas"], color: "#00aefb", emoji: "🗣️",
        summary: "Quem são os povos de Moçambique, de onde vêm e que línguas falam. O Censo 2017 registou 21 línguas, incluindo o português.",
        body: html(
            "Hoje, a maioria dos moçambicanos tem uma língua bantu como língua materna. O Censo de 2017 registou 21 línguas (incluindo o português) e mais de 80 % da população fala uma língua bantu como primeira língua.",
            "Em vez de “tribos”, os investigadores falam de <strong>grupos etnolinguísticos</strong>: comunidades que partilham língua, história e costumes. As principais famílias são Makhuwa-Lomwe (norte e centro-norte), Sena-Nyungwe (vale do Zambeze), Shona (Manica e Sofala), Tsonga (sul), Chope e Tswa (Inhambane), Yao e Nyanja (Niassa), Makonde e Mwani (Cabo Delgado).",
            "Use o mapa interativo acima para ver onde se fala cada língua e que províncias abrangem."
        ),
        facts: [{ label: "Línguas no Censo 2017", value: "21 (incluindo o português)" }, { label: "Mais falada", value: "Emakhuwa, 26,3 % de falantes nativos" }, { label: "Língua oficial", value: "Português (falado por cerca de 47,4 %)" }],
        tip: "As percentagens são do Censo 2017 (INE). O mapa é esquemático.", tipLabel: "Fonte",
    }),
    entry({
        slug: "primeiros-povos", title: "Os primeiros povos e a arte rupestre", tag: "Pré-história", categories: ["Pré-história"], color: "#a8483a", emoji: "🪨",
        summary: "Muito antes dos reinos, caçadores-recolectores ocuparam o território e deixaram pinturas em rochas.",
        body: html("Durante milhares de anos, pequenos grupos de caçadores-recolectores viveram do que a terra e o mar davam. Em várias zonas do país existem abrigos rochosos com pinturas e gravuras desses povos.", "Estas imagens são testemunhos preciosos de uma história que não foi escrita.")
    }),
    entry({
        slug: "migracoes-bantu", title: "As migrações bantu e a agricultura", tag: "Séculos I-XV", categories: ["Povos e línguas", "Economia"], color: "#35be12", emoji: "🌾",
        summary: "Comunidades de língua bantu trouxeram a agricultura e o trabalho do ferro, e deram origem à maioria dos povos de hoje.",
        body: html("Ao longo do primeiro milénio da nossa era, comunidades de língua bantu foram-se estabelecendo no território, trazendo a agricultura, a criação de gado e a metalurgia do ferro.", "Dessa mistura de povos nasceram as línguas e culturas que hoje reconhecemos em Moçambique.")
    }),
    entry({
        slug: "sofala-e-o-ouro", title: "Sofala e o comércio do ouro", tag: "Séculos I-XV", categories: ["Economia", "Comércio"], color: "#f0a83a", emoji: "🪙",
        summary: "O porto de Sofala ligava o ouro do planalto do interior às rotas do oceano Índico.",
        body: html("Durante séculos, o ouro e o marfim do interior desciam os rios até portos como Sofala, de onde eram exportados para a Arábia, a Índia e mais além.", "Em troca chegavam tecidos, contas e porcelana. Este comércio enriqueceu cidades da costa e Estados do interior.")
    }),
    entry({
        slug: "cidades-suaili", title: "As cidades suaílis da costa", tag: "Séculos I-XV", categories: ["Comércio", "Cultura"], color: "#00aefb", emoji: "⛵",
        summary: "A costa norte fazia parte do mundo suaíli: portos, mesquitas, comércio e línguas em contacto.",
        body: html("Antes da chegada dos portugueses, a costa de Moçambique estava integrada na rede de cidades-porto suaílis do Índico oriental africano. Mercadores árabes, persas e indianos negociavam com as comunidades locais.", "A Ilha de Moçambique e outros portos mantêm a herança dessa mistura de culturas.")
    }),
    entry({
        slug: "reino-do-mutapa", title: "O Reino do Mutapa", tag: "Séculos XV-XIX", categories: ["Reinos"], color: "#c86b8c", emoji: "👑",
        summary: "Um dos grandes Estados da África austral, que controlou ouro e marfim entre o planalto e o Zambeze.",
        body: html("O Reino do Mutapa (Monomotapa) surgiu no século XV no planalto a sul do Zambeze e estendeu a sua influência até ao vale do rio, controlando parte importante do comércio de ouro e marfim.", "Os portugueses entraram em contacto com este Estado a partir do século XVI.")
    }),
    entry({
        slug: "reinos-maravi", title: "Os reinos Maravi", tag: "Séculos XV-XIX", categories: ["Reinos"], color: "#1f6fe0", emoji: "🏞️",
        summary: "Estados de povos de língua nyanja e vizinhos, entre o lago Niassa e o vale do Zambeze.",
        body: html("A norte do Zambeze, vários reinos ligados à confederação Maravi controlaram rotas de comércio de marfim e ferro. As suas fronteiras ultrapassam as de hoje: pertencem à história comum de Moçambique, do Malawi e da Zâmbia.")
    }),
    entry({
        slug: "estado-de-gaza", title: "O Estado de Gaza", tag: "Séculos XV-XIX", categories: ["Reinos"], color: "#e5533d", emoji: "🛡️",
        summary: "Fundado por Soshangane nos anos 1820, dominou grande parte do sul até à derrota de Ngungunyane em 1895.",
        body: html("O Estado de Gaza foi criado por Soshangane, um chefe nguni que, nos anos 1820, se fixou no sul do atual Moçambique depois das guerras que abalaram a África austral.", "O seu último governante, Ngungunyane (Gungunhana), foi derrotado e capturado pelas forças portuguesas em 1895.")
    }),
    entry({
        slug: "makua-e-macondes", title: "Makua e Macondes: os povos do norte", tag: "Séculos XV-XIX", categories: ["Povos e línguas", "Cultura"], color: "#d98a00", emoji: "🎭",
        summary: "Os Makua são o maior grupo do país; os Macondes são famosos pelas máscaras e esculturas em ébano.",
        body: html("No norte vivem os Makua, o grupo etnolinguístico mais numeroso, e os Macondes, do planalto de Mueda. As máscaras do mapiko e as esculturas de ébano são hoje símbolo da arte moçambicana.")
    }),
];

/** História: Período Colonial. */
export const HISTORY_COLONIAL = [
    entry({ slug: "chegada-dos-portugueses", title: "A chegada dos portugueses (1498)", tag: "1498-1900", categories: ["Contacto europeu"], color: "#a8483a", emoji: "🚢",
        summary: "Vasco da Gama aportou na Ilha de Moçambique em 1498, a caminho da Índia.",
        body: html("Em 1498, a armada de Vasco da Gama parou na costa de Moçambique e na Ilha de Moçambique, que se tornou escala da rota da Índia.", "Os portugueses instalaram feitorias e fortes, como a Fortaleza de São Sebastião (iniciada em 1558).") }),
    entry({ slug: "prazos-da-zambezia", title: "Os prazos da Zambézia", tag: "1498-1900", categories: ["Economia"], color: "#35be12", emoji: "📜",
        summary: "Grandes propriedades no vale do Zambeze, arrendadas pela Coroa portuguesa, com poder local próprio.",
        body: html("Entre os séculos XVII e XIX, o sistema de prazos concedeu terras do vale do Zambeze a colonos e famílias locais. Os seus senhores formaram pequenos poderes quase independentes.") }),
    entry({ slug: "trafico-de-escravos", title: "O tráfico de escravos", tag: "1498-1900", categories: ["Sociedade"], color: "#0b1220", emoji: "⛓️",
        summary: "Do porto de Moçambique saíram, durante séculos, milhares de pessoas escravizadas.",
        body: html("O tráfico de pessoas escravizadas marcou profundamente a história do país, sobretudo nos séculos XVIII e XIX, ligando Moçambique às plantações do Índico e do Atlântico.", "A sua memória continua presente em ilhas e portos, e é hoje tema de estudo e de memória.") }),
    entry({ slug: "conferencia-de-berlim", title: "Conferência de Berlim e ocupação efetiva", tag: "1498-1900", categories: ["Colonização"], color: "#c86b8c", emoji: "🗺️",
        summary: "Em 1884-85, as potências europeias definiram regras para dividir África, e Portugal precisou de ocupar o território.",
        body: html("A Conferência de Berlim (1884-1885) exigiu a “ocupação efetiva” dos territórios. Portugal enviou campanhas militares ao interior, que enfrentaram resistências em todo o país.", "Em 1895, Ngungunyane, imperador de Gaza, foi capturado em Chaimite por Mouzinho de Albuquerque.") }),
    entry({ slug: "companhias-majestaticas", title: "As companhias majestáticas", tag: "1498-1900", categories: ["Economia"], color: "#f0a83a", emoji: "🏢",
        summary: "Companhias privadas receberam o direito de administrar grandes regiões: Moçambique, Niassa e Zambézia.",
        body: html("A partir de 1891, a Companhia de Moçambique (Manica e Sofala) e a Companhia do Niassa administraram vastos territórios, cobrando impostos e organizando trabalho. A Companhia da Zambézia explorava terras no vale do rio.") }),
    entry({ slug: "lourenco-marques-capital", title: "Lourenço Marques torna-se capital (1898)", tag: "1900-1964", categories: ["Cidades"], color: "#00aefb", emoji: "🏙️",
        summary: "A capital passou da Ilha de Moçambique para Lourenço Marques, hoje Maputo.",
        body: html("Em 1898, a capital da colónia mudou do norte para Lourenço Marques, no sul, perto das minas e dos caminhos-de-ferro da África do Sul. Foi o início do crescimento da atual cidade de Maputo.") }),
    entry({ slug: "chibalo-e-indigenato", title: "Chibalo e indigenato", tag: "1900-1964", categories: ["Sociedade"], color: "#a8483a", emoji: "⚒️",
        summary: "O trabalho forçado (chibalo) e a divisão legal entre “indígenas” e “assimilados” marcaram o século XX colonial.",
        body: html("Durante grande parte do século XX, muitos moçambicanos foram obrigados a trabalhar sem pagamento justo, em obras públicas e plantações. O estatuto do indigenato limitava direitos e liberdade de circulação.") }),
    entry({ slug: "nacionalismo-e-frelimo", title: "Nacionalismo e a criação da FRELIMO (1962)", tag: "1900-1964", categories: ["Resistência"], color: "#35be12", emoji: "✊",
        summary: "Associações, intelectuais e movimentos unem-se em 1962 na Frente de Libertação de Moçambique.",
        body: html("Em 25 de Junho de 1962, em Dar es Salaam, vários movimentos nacionalistas fundaram a FRELIMO, tendo Eduardo Mondlane como primeiro presidente.") }),
];

/** História: Moçambique Moderno. */
export const HISTORY_MODERN = [
    entry({ slug: "luta-armada", title: "A luta armada de libertação (1964)", tag: "1964-1975", categories: ["Independência"], color: "#e5533d", emoji: "🔥",
        summary: "Em 25 de Setembro de 1964 iniciou-se a luta armada no norte, em Cabo Delgado.",
        body: html("A luta armada começou em 25 de Setembro de 1964, em Chai (Cabo Delgado). Durante dez anos, a FRELIMO controlou zonas libertadas e organizou escolas e hospitais.") }),
    entry({ slug: "eduardo-mondlane", title: "Eduardo Mondlane (1920-1969)", tag: "1964-1975", categories: ["Personagens"], color: "#1f6fe0", emoji: "🎓",
        summary: "Sociólogo e primeiro presidente da FRELIMO, foi assassinado em Dar es Salaam em 1969.",
        body: html("Eduardo Chivambo Mondlane foi o primeiro presidente da FRELIMO. Morreu a 3 de Fevereiro de 1969, vítima de um atentado em Dar es Salaam. É considerado “Arquiteto da Unidade Nacional”.") }),
    entry({ slug: "independencia-1975", title: "A Independência (25 de Junho de 1975)", tag: "1964-1975", categories: ["Independência"], color: "#0054b5", emoji: "🇲🇿",
        summary: "Moçambique torna-se independente, com Samora Machel como primeiro presidente.",
        body: html("A 25 de Junho de 1975, no Estádio da Machava, em Maputo, foi proclamada a independência. Samora Machel tornou-se o primeiro Presidente da República.") }),
    entry({ slug: "samora-machel", title: "Samora Machel (1933-1986)", tag: "1975-1992", categories: ["Personagens"], color: "#35be12", emoji: "🎖️",
        summary: "Primeiro presidente do país, morreu em 1986 num acidente de aviação em Mbuzini.",
        body: html("Samora Moisés Machel liderou a FRELIMO a partir de 1970 e foi o primeiro presidente. Faleceu a 19 de Outubro de 1986, quando o avião presidencial caiu junto à fronteira com a África do Sul.") }),
    entry({ slug: "guerra-civil", title: "A guerra civil (1977-1992)", tag: "1975-1992", categories: ["Guerra e paz"], color: "#a8483a", emoji: "🕊️",
        summary: "Um conflito de 16 anos entre o Governo e a RENAMO, que causou enorme sofrimento.",
        body: html("Entre 1977 e 1992, a guerra entre o Governo da FRELIMO e a RENAMO destruiu infraestruturas, deslocou milhões de pessoas e marcou uma geração.") }),
    entry({ slug: "acordo-de-roma", title: "O Acordo Geral de Paz (Roma, 1992)", tag: "1992-hoje", categories: ["Guerra e paz"], color: "#00aefb", emoji: "🤝",
        summary: "A 4 de Outubro de 1992, em Roma, foi assinado o acordo que pôs fim à guerra.",
        body: html("O Acordo Geral de Paz, assinado em Roma a 4 de Outubro de 1992 pelo presidente Joaquim Chissano e por Afonso Dhlakama, abriu caminho às primeiras eleições multipartidárias de 1994.") }),
    entry({ slug: "democracia", title: "Democracia multipartidária", tag: "1992-hoje", categories: ["Política"], color: "#f0a83a", emoji: "🗳️",
        summary: "A Constituição de 1990 e as eleições de 1994 inauguraram a era multipartidária.",
        body: html("A Constituição de 1990 abriu o sistema político ao multipartidarismo. As primeiras eleições gerais realizaram-se em 1994.") }),
    entry({ slug: "presidentes", title: "Os Presidentes da República", tag: "1992-hoje", categories: ["Política", "Personagens"], color: "#c86b8c", emoji: "🏛️",
        summary: "De Samora Machel a Daniel Chapo: quem presidiu ao país desde 1975.",
        facts: [{ label: "1975-1986", value: "Samora Machel" }, { label: "1986-2005", value: "Joaquim Chissano" }, { label: "2005-2015", value: "Armando Guebuza" }, { label: "2015-2025", value: "Filipe Nyusi" }, { label: "Desde 2025", value: "Daniel Chapo" }] }),
    entry({ slug: "clima-e-ciclones", title: "Cheias e ciclones", tag: "1992-hoje", categories: ["Ambiente"], color: "#1f6fe0", emoji: "🌀",
        summary: "As cheias de 2000 e os ciclones Idai e Kenneth (2019) e Freddy (2023) testaram a resiliência do país.",
        body: html("Moçambique é um dos países mais expostos a ciclones tropicais e cheias. Em 2019, o ciclone Idai devastou a região da Beira e, semanas depois, o Kenneth atingiu Cabo Delgado.") }),
    entry({ slug: "novas-infraestruturas", title: "Pontes, portos e gás natural", tag: "1992-hoje", categories: ["Economia"], color: "#d98a00", emoji: "🌉",
        summary: "Ponte Maputo-Katembe (2018), corredores de desenvolvimento e gás natural no Rovuma.",
        body: html("A ponte Maputo-Katembe foi inaugurada em 2018. No norte, os projetos de gás natural liquefeito no Rovuma começaram a produzir em 2022.") }),
];
