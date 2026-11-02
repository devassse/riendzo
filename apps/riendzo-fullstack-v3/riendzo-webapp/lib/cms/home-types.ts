/** Client-safe pieces of the Home settings (no server imports). */
export const MAX_EXPERIENCES = 6;
export const EXPERIENCE_ICONS = [
    { value: "whale", label: "Vida marinha" }, { value: "reef", label: "Mergulho / recife" }, { value: "paw", label: "Safári / natureza" },
    { value: "landmark", label: "Património" }, { value: "sail", label: "Ilhas / vela" }, { value: "city", label: "Cidade" },
] as const;
export type ExperienceIcon = (typeof EXPERIENCE_ICONS)[number]["value"];

export type ExperienceRef = {
    collection: string;
    slug: string;
    /** optional overrides of what the card shows (default: the registered content) */
    headline?: string;
    location?: string;
    bestTime?: string;
    tag?: string;
    image?: string;
    icon?: ExperienceIcon;
};
export type HomeHeading = { eyebrow?: string; title?: string; subtitle?: string };
export type HomeConfig = {
    experiences: ExperienceRef[];
    heading?: HomeHeading;
    /** true once someone chose what shows on the Home in the BackOffice (until then the initial set is used) */
    flagsManaged?: boolean;
};

