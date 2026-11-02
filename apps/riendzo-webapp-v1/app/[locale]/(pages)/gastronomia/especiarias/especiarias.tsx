import { getTranslations } from "next-intl/server";
import EspeciariasGrid, {
    type Especiaria,
    type EspeciariasGridLabels,
} from "./especiarias-grid";

/**
 * EXAMPLE DATA — review regions / uses / pairings and replace with your own
 * (or load them from your CMS / database, or move the text to next-intl).
 *
 * Photos:  images: ["/especiarias/piri-piri-1.jpg", ...]
 * Videos:  videos: [{
 *            youtubeId: "ID_DO_VIDEO",
 *            title: "Título do vídeo",
 *            creator: "Nome do criador",
 *            channelUrl: "https://www.youtube.com/@canal",
 *          }]
 *
 * Without photos a colour block is shown; without videos the video
 * section is hidden. Ask each creator for permission and always credit them.
 */
const ESPECIARIAS: Especiaria[] = [
    {
        slug: "piri-piri",
        name: "Piri-Piri",
        kind: "Pimenta",
        region: "Todo o país",
        color: "#e5533d",
        heat: 5,
        description:
            "A pimenta picante por excelência da cozinha moçambicana, usada fresca, seca ou transformada em molho.",
        flavor: "Picante intenso, com um toque frutado e ácido.",
        uses: [
            "Molho de piri-piri",
            "Marinadas",
            "Grelhados",
            "Caril",
            "Mesa, para quem gosta de picante",
        ],
        pairsWith: ["Alho", "Limão", "Azeite", "Coentros"],
        dishes: [
            "Frango à Cafreal",
            "Camarão ao Piri-Piri",
            "Peixe grelhado",
            "Matapa",
        ],
        storage:
            "Seque ao sol e guarde em frasco fechado, ou conserve em azeite no frio. Use luvas ao manusear e evite tocar nos olhos.",
        images: [],
        videos: [],
    },
    {
        slug: "massala",
        name: "Massala",
        kind: "Mistura de especiarias",
        region: "Costa e cidades",
        color: "#f0a83a",
        heat: 2,
        description:
            "Mistura aromática de especiarias moídas, herança das influências indianas na culinária da costa.",
        flavor: "Quente, aromático e terroso, com notas doces e picantes.",
        uses: ["Caris", "Recheios", "Guisados", "Marinadas de carne"],
        pairsWith: ["Cebola", "Tomate", "Leite de coco", "Alho"],
        dishes: ["Caril de Caranguejo", "Caril de Camarão", "Chamuças"],
        storage:
            "Guarde em frasco hermético, longe da luz e do calor. Perde aroma depressa quando está moída há muito tempo.",
        images: [],
        videos: [],
    },
    {
        slug: "colorau",
        name: "Colorau",
        kind: "Pó de pimento",
        region: "Todo o país",
        color: "#c86b8c",
        heat: 1,
        description:
            "Pó vermelho de pimento seco, usado para dar cor e um sabor suave aos pratos.",
        flavor: "Doce e suave, com um leve fumado.",
        uses: ["Marinadas", "Arroz", "Refogados", "Frangos grelhados"],
        pairsWith: ["Alho", "Limão", "Piri-piri", "Óleo"],
        dishes: ["Frango à Cafreal", "Arroz de mariscos"],
        storage:
            "Mantenha em frasco bem fechado e longe da luz para não perder a cor.",
        images: [],
        videos: [],
    },
    {
        slug: "gengibre",
        name: "Gengibre",
        kind: "Raiz",
        region: "Zambézia e Nampula",
        color: "#35be12",
        heat: 2,
        description:
            "Raiz fresca e aromática, usada ralada em refogados, caris e infusões.",
        flavor: "Picante, fresco e cítrico.",
        uses: ["Refogados", "Caris", "Chás e infusões", "Sumos"],
        pairsWith: ["Alho", "Limão", "Mel", "Leite de coco"],
        dishes: ["Caril de Galinha com Amendoim", "Chá de gengibre"],
        storage:
            "Guarde a raiz inteira, seca, no frigorífico, ou congele já ralada em pequenas porções.",
        images: [],
        videos: [],
    },
    {
        slug: "canela",
        name: "Canela",
        kind: "Casca aromática",
        region: "Costa",
        color: "#c86b8c",
        heat: 0,
        description:
            "Casca enrolada de aroma doce e quente, usada em doces, bebidas e alguns pratos salgados.",
        flavor: "Doce, quente e amadeirada.",
        uses: ["Doces", "Calda de açúcar", "Chás", "Arroz doce"],
        pairsWith: ["Coco", "Açúcar", "Cravinho", "Leite"],
        dishes: ["Cocada", "Bolos", "Arroz doce"],
        storage:
            "Prefira o pau inteiro, que mantém o aroma durante mais tempo do que a canela em pó.",
        images: [],
        videos: [],
    },
    {
        slug: "acafrao-da-terra",
        name: "Açafrão-da-terra",
        kind: "Raiz em pó",
        region: "Norte do país",
        color: "#f0a83a",
        heat: 0,
        description:
            "Pó amarelo de cúrcuma, que dá cor intensa aos pratos e um sabor terroso suave.",
        flavor: "Terroso, ligeiramente amargo e quente.",
        uses: ["Arroz", "Caris", "Peixe", "Marinadas"],
        pairsWith: ["Gengibre", "Alho", "Leite de coco", "Pimenta"],
        dishes: ["Arroz de coco", "Caril de Camarão com Coco"],
        storage:
            "Manche facilmente: use colher seca e guarde em frasco escuro e fechado.",
        images: [],
        videos: [],
    },
    {
        slug: "tamarindo",
        name: "Tamarindo",
        kind: "Fruto",
        region: "Inhambane e Gaza",
        color: "#00aefb",
        heat: 0,
        description:
            "Fruto de polpa ácida e doce, usado em molhos, sumos e refrescos.",
        flavor: "Agridoce, azedo e frutado.",
        uses: ["Molhos", "Sumos", "Doces", "Marinadas"],
        pairsWith: ["Açúcar", "Piri-piri", "Peixe", "Camarão"],
        dishes: ["Sumo de tamarindo", "Molhos agridoces"],
        storage:
            "Guarde a polpa prensada no frigorífico, bem embrulhada, e dissolva em água quente antes de usar.",
        images: [],
        videos: [],
    },
    {
        slug: "coentros",
        name: "Coentros",
        kind: "Erva aromática",
        region: "Todo o país",
        color: "#35be12",
        heat: 0,
        description:
            "Folhas frescas de aroma marcante, usadas para finalizar pratos e dar frescura.",
        flavor: "Fresco, cítrico e herbáceo.",
        uses: ["Finalização de pratos", "Molhos", "Saladas", "Caris"],
        pairsWith: ["Limão", "Alho", "Piri-piri", "Camarão"],
        dishes: [
            "Camarão ao Piri-Piri",
            "Caril de Camarão com Coco",
            "Chamuças",
        ],
        storage:
            "Guarde os molhos num copo com água, tapados, no frigorífico. Junte só no fim da cozedura.",
        images: [],
        videos: [],
    },
];

export default async function EspeciariasSection() {
    const t = await getTranslations("gastronomy.especiariasSection");

    const labels: EspeciariasGridLabels = {
        flavor: t("flavor"),
        uses: t("uses"),
        pairsWith: t("pairsWith"),
        dishes: t("dishes"),
        storage: t("storage"),
        region: t("region"),
        videos: t("videos"),
        // raw template, filled in on the client: "Picância {level} de 5"
        heat: t.raw("heat") as string,
        // raw template, filled in on the client: "por {creator}"
        videoBy: t.raw("videoBy") as string,
        viewDetails: t("viewDetails"),
        hasVideo: t("hasVideo"),
        photoSoon: t("photoSoon"),
        close: t("close"),
    };

    return (
        <section id="especiarias" className="relative scroll-mt-24 bg-white">
            <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
                <header className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
                    <h2 className="text-3xl font-bold leading-[1.1] text-[#0b1220] sm:text-5xl">
                        {t("title")}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-[#5b6478]">
                        {t("description")}
                    </p>
                </header>

                <EspeciariasGrid especiarias={ESPECIARIAS} labels={labels} />
            </div>
        </section>
    );
}