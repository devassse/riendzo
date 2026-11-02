import { COUNTRY_PATH, FRAME, MAP_SIZE } from "./mozambique-map";
/**
 * Reference data about Mozambique used by the history pages (language map,
 * provinces and demographics). Population: Census 2017 (INE, IV RGPH),
 * rounded. Languages: INE Census 2017 + linguistic literature. The map is
 * schematic, not a cartographic source.
 */

export type Province = {
    id: string;
    name: string;
    capital: string;
    /** Inhabitants, Census 2017, in millions (rounded) */
    population: number;
    /** km², rounded */
    area: number;
    /** Main cities / districts to know */
    places: string[];
    languages: string[];
    /** Approximate centre: [longitude, latitude] */
    at: [number, number];
};

export const PROVINCES: Province[] = [
    { id: "cabo-delgado", name: "Cabo Delgado", capital: "Pemba", population: 2.3, area: 82600, places: ["Pemba", "Montepuez", "Mocímboa da Praia", "Palma", "Macomia", "Ibo"], languages: ["Emakhuwa", "Shimakonde", "Kimwani"], at: [39.2, -12.6] },
    { id: "niassa", name: "Niassa", capital: "Lichinga", population: 1.8, area: 129100, places: ["Lichinga", "Cuamba", "Metangula", "Mecula", "Mandimba"], languages: ["Ciyao", "Cinyanja", "Emakhuwa"], at: [36.0, -13.0] },
    { id: "nampula", name: "Nampula", capital: "Nampula", population: 6.1, area: 81600, places: ["Nampula", "Nacala", "Ilha de Moçambique", "Angoche", "Monapo"], languages: ["Emakhuwa"], at: [39.3, -15.0] },
    { id: "zambezia", name: "Zambézia", capital: "Quelimane", population: 5.1, area: 105000, places: ["Quelimane", "Mocuba", "Gurué", "Alto Molócuè", "Milange"], languages: ["Elomwe", "Echuwabo", "Emakhuwa"], at: [37.0, -16.8] },
    { id: "tete", name: "Tete", capital: "Tete", population: 2.6, area: 100700, places: ["Tete", "Moatize", "Songo (Cahora Bassa)", "Zumbo", "Angónia"], languages: ["Cinyungwe", "Cinyanja"], at: [33.6, -15.9] },
    { id: "manica", name: "Manica", capital: "Chimoio", population: 1.9, area: 61700, places: ["Chimoio", "Manica", "Gondola", "Sussundenga", "Espungabera"], languages: ["Cindau", "Citeve"], at: [33.0, -19.0] },
    { id: "sofala", name: "Sofala", capital: "Beira", population: 2.3, area: 68000, places: ["Beira", "Dondo", "Nhamatanda", "Gorongosa", "Marromeu"], languages: ["Cisena", "Cindau"], at: [34.7, -18.6] },
    { id: "inhambane", name: "Inhambane", capital: "Inhambane", population: 1.5, area: 68600, places: ["Inhambane", "Maxixe", "Vilankulo", "Massinga", "Zavala"], languages: ["Xitswa", "Cicopi", "Xichangana"], at: [34.6, -22.7] },
    { id: "gaza", name: "Gaza", capital: "Xai-Xai", population: 1.4, area: 75700, places: ["Xai-Xai", "Chókwè", "Chibuto", "Bilene", "Massingir"], languages: ["Xichangana"], at: [32.9, -23.6] },
    { id: "maputo-provincia", name: "Maputo (província)", capital: "Matola", population: 1.9, area: 26100, places: ["Matola", "Boane", "Marracuene", "Namaacha", "Manhiça"], languages: ["Xirhonga", "Xichangana"], at: [32.5, -25.6] },
    { id: "maputo-cidade", name: "Maputo Cidade", capital: "Maputo", population: 1.1, area: 300, places: ["Baixa", "Polana", "Sommerschield", "Mafalala", "Costa do Sol", "Katembe"], languages: ["Xirhonga", "Português"], at: [32.57, -25.95] },
];

export const TOTAL_POPULATION_2017 = 27.9;

export type Language = {
    id: string;
    name: string;
    /** Other names used for it */
    aka?: string;
    group: string;
    provinces: string[];
    /** Heartland on the schematic map: [lon, lat, radius in degrees] */
    area?: [number, number, number];
    color: string;
    /** Percentage of the population with this first language (Census 2017), when verified */
    percent?: number;
    note: string;
};

export const LANGUAGES: Language[] = [
    { id: "emakhuwa", name: "Emakhuwa", aka: "Macua", group: "Makhuwa-Lomwe", provinces: ["Nampula", "Cabo Delgado", "Niassa", "Zambézia"], area: [39.0, -14.6, 1.9], color: "#e5533d", percent: 26.3, note: "A língua materna mais falada do país (cerca de 5,9 milhões de falantes no Censo 2017). Língua bantu do norte e centro-norte; o povo Macua é o maior grupo etnolinguístico." },
    { id: "elomwe", name: "Elomwe", aka: "Lomwe", group: "Makhuwa-Lomwe", provinces: ["Zambézia", "Nampula"], area: [37.3, -16.2, 1.2], color: "#d98a00", note: "Língua bantu muito próxima do Emakhuwa, falada sobretudo no interior da Zambézia e no sul de Nampula." },
    { id: "echuwabo", name: "Echuwabo", aka: "Chuabo", group: "Makhuwa-Lomwe", provinces: ["Zambézia"], area: [36.9, -17.5, 0.8], color: "#f0a83a", note: "Língua da zona costeira da Zambézia, em torno de Quelimane." },
    { id: "cisena", name: "Cisena", aka: "Sena", group: "Sena-Nyungwe", provinces: ["Sofala", "Tete", "Zambézia"], area: [35.1, -17.9, 1.0], color: "#a85bd6", note: "Falada no vale do Zambeze, na região de Sofala e no sul de Tete." },
    { id: "cinyungwe", name: "Cinyungwe", aka: "Nyungwe", group: "Sena-Nyungwe", provinces: ["Tete"], area: [33.0, -16.2, 1.0], color: "#c86b8c", note: "Língua do vale do Zambeze, na província de Tete." },
    { id: "cindau", name: "Cindau", aka: "Ndau", group: "Shona", provinces: ["Sofala", "Manica"], area: [33.9, -19.6, 1.0], color: "#1f6fe0", note: "Pertence ao grupo shona, falada no sul de Sofala e em Manica. O Citeve é uma variedade próxima em Manica." },
    { id: "ciyao", name: "Ciyao", aka: "Yao", group: "Yao", provinces: ["Niassa", "Cabo Delgado"], area: [36.3, -12.7, 1.0], color: "#35be12", note: "Língua do povo Yao, no norte de Niassa, em torno do lago Niassa e do rio Rovuma." },
    { id: "cinyanja", name: "Cinyanja", aka: "Nyanja / Chichewa", group: "Nyanja", provinces: ["Niassa", "Tete", "Zambézia"], area: [34.3, -14.2, 0.9], color: "#2f9e44", note: "Falada junto à fronteira com o Malawi e a Zâmbia." },
    { id: "shimakonde", name: "Shimakonde", aka: "Makonde", group: "Makonde", provinces: ["Cabo Delgado"], area: [39.8, -11.5, 0.8], color: "#0370d6", note: "Língua do planalto de Mueda, em Cabo Delgado. Os escultores macondes são famosos mundialmente." },
    { id: "kimwani", name: "Kimwani", aka: "Mwani", group: "Swahili / costa", provinces: ["Cabo Delgado"], area: [40.5, -12.3, 0.45], color: "#00aefb", note: "Língua costeira do norte de Cabo Delgado, com forte ligação às cidades suaílis." },
    { id: "xichangana", name: "Xichangana", aka: "Changana / Tsonga", group: "Tsonga", provinces: ["Gaza", "Maputo (província)", "Inhambane"], area: [32.9, -24.0, 1.4], color: "#00a38a", percent: 8.9, note: "A principal língua do sul (8,9 % no Censo 2017). Pertence ao grupo tsonga; no século XIX o Estado de Gaza espalhou-a por grande parte do sul." },
    { id: "xirhonga", name: "Xirhonga", aka: "Ronga", group: "Tsonga", provinces: ["Maputo Cidade", "Maputo (província)"], area: [32.6, -25.7, 0.5], color: "#7a5bd6", note: "A língua tradicional da região de Maputo e Matola." },
    { id: "xitswa", name: "Xitswa", aka: "Tswa", group: "Tswa-Ronga", provinces: ["Inhambane"], area: [34.6, -23.1, 0.8], color: "#b5651d", note: "Língua do litoral de Inhambane." },
    { id: "cicopi", name: "Cicopi", aka: "Chope", group: "Chope", provinces: ["Inhambane", "Gaza"], area: [34.0, -24.4, 0.7], color: "#d23b8a", note: "Língua do povo Chope, de Zavala. A sua música de timbila foi proclamada pela UNESCO em 2005." },
    { id: "portugues", name: "Português", group: "Língua oficial", provinces: ["Todo o país"], color: "#0054b5", note: "Língua oficial e língua de unidade nacional. Cerca de 47,4 % da população fala português (Censo 2017), mais nas cidades; para uma minoria é a língua materna." },
];

/**
 * Simplified outline of Mozambique as [longitude, latitude] (clockwise,
 * starting at the mouth of the Rovuma). Schematic: good for illustration only.
 */
/** @deprecated kept for reference; the map now uses COUNTRY_PATH */
export const OUTLINE: [number, number][] = [
    [40.43, -10.47], [40.62, -10.9], [40.48, -11.6], [40.6, -12.2], [40.52, -12.97], [40.6, -14.0], [40.72, -14.9], [40.2, -15.9],
    [39.6, -16.5], [38.2, -17.3], [37.1, -17.9], [36.4, -18.7], [35.4, -19.5], [34.8, -19.9], [35.0, -20.7], [35.3, -21.9],
    [35.4, -22.9], [35.5, -23.9], [34.9, -24.2], [33.9, -24.8], [33.0, -25.3], [32.9, -25.75], [32.9, -26.85],
    [32.1, -26.85], [31.98, -26.0], [32.0, -25.45], [31.5, -24.5], [31.3, -23.6], [31.3, -22.4], [32.0, -21.4], [32.5, -21.2],
    [32.75, -20.5], [32.9, -19.9], [33.0, -19.0], [32.85, -18.5], [32.7, -17.9], [32.9, -16.9], [32.1, -16.4], [31.3, -16.1],
    [30.4, -15.6], [30.3, -14.9], [31.4, -14.4], [32.4, -14.0], [33.2, -14.0], [33.9, -14.5], [34.5, -15.5], [35.0, -16.2],
    [35.3, -17.1], [35.9, -16.5], [35.8, -15.6], [35.2, -14.8], [34.9, -14.0], [34.8, -13.5], [34.7, -12.4], [34.6, -11.6],
    [35.6, -11.6], [36.9, -11.6], [38.0, -11.3], [39.3, -11.1], [40.0, -10.8],
];

/**
 * Projection to the SVG drawing in mozambique-map.ts (calibrated to Mozambique's real coordinates,
 * so places and language areas given as [longitude, latitude] land where they should).
 */
export const MAP = { width: MAP_SIZE.width, height: MAP_SIZE.height, /** pixels per degree */ scale: 42 };
export const project = ([lon, lat]: [number, number]) => ({
    x: FRAME.offset + ((lon - FRAME.lon[0]) / (FRAME.lon[1] - FRAME.lon[0])) * FRAME.width,
    y: FRAME.offset + ((FRAME.lat[0] - lat) / (FRAME.lat[0] - FRAME.lat[1])) * FRAME.height,
});
export const outlinePath = () => COUNTRY_PATH;
