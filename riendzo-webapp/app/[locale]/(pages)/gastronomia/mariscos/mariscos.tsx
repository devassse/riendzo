import { getTranslations } from "next-intl/server";
import MariscosGrid, {
    type MariscosGridLabels,
    type Prato,
} from "./mariscos-grid";

/**
 * EXAMPLE DATA — review quantities / regions and replace with your own
 * (or load them from your CMS / database, or move the text to next-intl).
 *
 * Photos:  images: ["/mariscos/camarao-grelhado-1.jpg", ...]
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
const PRATOS: Prato[] = [
    {
        slug: "camarao-grelhado",
        name: "Camarão Grelhado",
        region: "Costa",
        color: "#e5533d",
        minutes: 30,
        servings: 4,
        difficulty: "easy",
        description:
            "Camarão grande grelhado na brasa com manteiga de alho, limão e piri-piri.",
        ingredients: [
            "1 kg de camarão grande com casca",
            "5 dentes de alho picados",
            "80 g de manteiga derretida",
            "Sumo de 2 limões",
            "2 colheres de sopa de molho de piri-piri",
            "Salsa picada",
            "Sal grosso a gosto",
        ],
        steps: [
            "Abra o camarão ao meio pelas costas, sem separar, e retire o fio escuro.",
            "Misture a manteiga com o alho, o limão, o piri-piri e o sal.",
            "Pincele o camarão com a mistura e deixe repousar 10 minutos.",
            "Grelhe 3 a 4 minutos de cada lado, em lume forte, até ficar rosado.",
            "Regue com a manteiga restante, polvilhe com salsa e sirva de imediato.",
        ],
        tip: "Grelhe com a casca: protege a carne e dá mais sabor ao camarão.",
        images: [],
        videos: [],
    },
    {
        slug: "caril-de-ameijoas",
        name: "Caril de Ameijoas",
        region: "Inhambane",
        color: "#f0a83a",
        minutes: 35,
        servings: 4,
        difficulty: "easy",
        description:
            "Ameijoas abertas num molho de coco com tomate, alho e especiarias.",
        ingredients: [
            "1 kg de ameijoas bem lavadas",
            "1 cebola",
            "3 dentes de alho",
            "2 tomates maduros",
            "1 colher de sopa de massala de caril",
            "300 ml de leite de coco",
            "Coentros e sal a gosto",
        ],
        steps: [
            "Deixe as ameijoas em água com sal durante 1 hora para largarem a areia.",
            "Refogue a cebola e o alho em óleo até ficarem macios.",
            "Junte o tomate picado e o caril e cozinhe até formar um molho.",
            "Adicione o leite de coco e, quando ferver, coloque as ameijoas. Tape e cozinhe 5 a 7 minutos, até abrirem.",
            "Deite fora as que ficarem fechadas, polvilhe com coentros e sirva com arroz.",
        ],
        tip: "Não junte sal antes de as ameijoas abrirem: elas já libertam sal natural.",
        images: [],
        videos: [],
    },
    {
        slug: "mexilhoes-ao-alho",
        name: "Mexilhões ao Alho",
        region: "Costa",
        color: "#c86b8c",
        minutes: 25,
        servings: 4,
        difficulty: "easy",
        description:
            "Mexilhões cozidos a vapor num caldo de alho, limão e vinho branco.",
        ingredients: [
            "1,5 kg de mexilhões limpos",
            "6 dentes de alho laminados",
            "1 copo de vinho branco",
            "Sumo de 1 limão",
            "3 colheres de sopa de azeite",
            "1 piri-piri",
            "Coentros picados",
        ],
        steps: [
            "Lave os mexilhões e retire as barbas. Descarte os que estiverem abertos.",
            "Doure o alho no azeite sem o deixar queimar.",
            "Junte o piri-piri e o vinho e deixe ferver 1 minuto.",
            "Adicione os mexilhões, tape e cozinhe 5 a 6 minutos, até abrirem.",
            "Regue com limão, polvilhe com coentros e sirva com o caldo e pão fresco.",
        ],
        tip: "Agite a panela a meio da cozedura para os mexilhões abrirem por igual.",
        images: [],
        videos: [],
    },
    {
        slug: "polvo-grelhado",
        name: "Polvo Grelhado",
        region: "Ilha de Moçambique",
        color: "#00aefb",
        minutes: 90,
        servings: 4,
        difficulty: "medium",
        description:
            "Polvo cozido até ficar macio e depois grelhado com azeite, alho e limão.",
        ingredients: [
            "1 polvo de cerca de 1,5 kg",
            "1 cebola",
            "1 folha de louro",
            "4 dentes de alho",
            "5 colheres de sopa de azeite",
            "Sumo de 1 limão",
            "Salsa picada e sal a gosto",
        ],
        steps: [
            "Coza o polvo numa panela tapada, com a cebola e o louro, durante 50 a 60 minutos, sem juntar água.",
            "Espete uma faca na parte mais grossa para ver se está macio e deixe arrefecer um pouco.",
            "Corte os tentáculos e tempere com alho esmagado, azeite e limão.",
            "Grelhe em lume forte 3 a 4 minutos de cada lado, até ganhar cor.",
            "Regue com azeite, polvilhe com salsa e sirva com batata ou arroz.",
        ],
        tip: "O polvo liberta a sua própria água ao cozer, por isso não precisa de juntar líquido.",
        images: [],
        videos: [],
    },
    {
        slug: "lagosta-com-manteiga-de-alho",
        name: "Lagosta com Manteiga de Alho",
        region: "Inhambane",
        color: "#c86b8c",
        minutes: 35,
        servings: 2,
        difficulty: "medium",
        description:
            "Lagosta aberta ao meio, grelhada e regada com manteiga de alho e limão.",
        ingredients: [
            "2 lagostas",
            "100 g de manteiga",
            "4 dentes de alho picados",
            "Sumo de 1 limão",
            "1 piri-piri (opcional)",
            "Salsa picada",
            "Sal a gosto",
        ],
        steps: [
            "Abra as lagostas ao meio, no sentido do comprimento, e retire o tubo digestivo.",
            "Derreta a manteiga com o alho, o limão, o piri-piri e a salsa.",
            "Coloque as lagostas com a carne para cima e pincele com a manteiga.",
            "Grelhe 8 a 10 minutos em lume médio, pincelando mais manteiga a meio.",
            "Sirva de imediato com limão e batata ou arroz.",
        ],
        tip: "Retire do lume quando a carne estiver opaca e firme: passa do ponto muito depressa.",
        images: [],
        videos: [],
    },
    {
        slug: "caranguejo-cozido",
        name: "Caranguejo Cozido",
        region: "Maputo",
        color: "#e5533d",
        minutes: 40,
        servings: 4,
        difficulty: "easy",
        description:
            "Caranguejos cozidos em água temperada e servidos com limão e molho de piri-piri.",
        ingredients: [
            "4 caranguejos vivos e bem lavados",
            "1 cebola cortada ao meio",
            "2 folhas de louro",
            "1 colher de sopa de sal grosso",
            "Limão para servir",
            "Molho de piri-piri para servir",
        ],
        steps: [
            "Leve ao lume uma panela grande com água, a cebola, o louro e o sal.",
            "Quando a água ferver, coloque os caranguejos e tape.",
            "Cozinhe 15 a 20 minutos, até a casca ficar bem vermelha.",
            "Escorra e deixe repousar 5 minutos.",
            "Sirva com limão, piri-piri e pão para molhar.",
        ],
        tip: "Parta ligeiramente as pinças antes de servir para facilitar a quem come.",
        images: [],
        videos: [],
    },
    {
        slug: "arroz-de-mariscos",
        name: "Arroz de Mariscos",
        region: "Costa",
        color: "#f0a83a",
        minutes: 55,
        servings: 6,
        difficulty: "medium",
        description:
            "Arroz malandrinho cozinhado num caldo de mariscos com camarão, ameijoas e lulas.",
        ingredients: [
            "2 chávenas de arroz",
            "400 g de camarão",
            "400 g de ameijoas",
            "300 g de lulas em anéis",
            "1 cebola",
            "3 dentes de alho",
            "2 tomates",
            "1 litro de caldo de peixe",
            "Coentros e sal a gosto",
        ],
        steps: [
            "Refogue a cebola e o alho em azeite e junte o tomate picado até desfazer.",
            "Adicione o arroz e mexa 1 minuto.",
            "Deite o caldo quente, tempere e cozinhe em lume brando 10 minutos.",
            "Junte as lulas, as ameijoas e o camarão e cozinhe mais 8 a 10 minutos, até o arroz ficar cremoso.",
            "Polvilhe com coentros e sirva logo, na própria panela.",
        ],
        tip: "Junte o camarão no fim para ficar suculento e não endurecer.",
        images: [],
        videos: [],
    },
    {
        slug: "bolinhos-de-camarao",
        name: "Bolinhos de Camarão",
        region: "Maputo",
        color: "#00aefb",
        minutes: 40,
        servings: 6,
        difficulty: "easy",
        description:
            "Bolinhos fritos de camarão picado, crocantes por fora e suculentos por dentro.",
        ingredients: [
            "400 g de camarão descascado e picado",
            "1 cebola pequena",
            "2 dentes de alho",
            "1 chávena de farinha",
            "1 ovo",
            "Coentros picados",
            "Piri-piri, sal e óleo para fritar",
        ],
        steps: [
            "Misture o camarão com a cebola, o alho e os coentros picados.",
            "Junte o ovo, a farinha, o piri-piri e o sal até formar uma massa grossa.",
            "Aqueça o óleo e deixe cair colheradas de massa.",
            "Frite 2 a 3 minutos de cada lado, até dourarem.",
            "Escorra em papel absorvente e sirva quentes, com limão.",
        ],
        tip: "Se a massa ficar mole, junte um pouco mais de farinha antes de fritar.",
        images: [],
        videos: [],
    },
];

export default async function MariscosSection() {
    const t = await getTranslations("gastronomy.mariscosSection");

    const labels: MariscosGridLabels = {
        ingredients: t("ingredients"),
        steps: t("steps"),
        tip: t("tip"),
        videos: t("videos"),
        // raw templates, filled in on the client: "{count} min"
        minutes: t.raw("minutes") as string,
        servings: t.raw("servings") as string,
        // raw template, filled in on the client: "por {creator}"
        videoBy: t.raw("videoBy") as string,
        difficulty: {
            easy: t("difficulty.easy"),
            medium: t("difficulty.medium"),
            hard: t("difficulty.hard"),
        },
        viewRecipe: t("viewRecipe"),
        hasVideo: t("hasVideo"),
        photoSoon: t("photoSoon"),
        close: t("close"),
    };

    return (
        <section id="mariscos" className="relative scroll-mt-24 bg-white">
            <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
                <header className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
                    <h2 className="text-3xl font-bold leading-[1.1] text-[#0b1220] sm:text-5xl">
                        {t("title")}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-[#5b6478]">
                        {t("description")}
                    </p>
                </header>

                <MariscosGrid pratos={PRATOS} labels={labels} />
            </div>
        </section>
    );
}