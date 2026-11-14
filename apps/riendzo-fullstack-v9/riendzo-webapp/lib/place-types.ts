/**
 * "Os meus locais": places a member saves in his own profile. A member can keep them private or
 * suggest them to the platform team, who review, adjust and publish them in the matching menu.
 * Pure data (safe to import from client components).
 */
import type { GeoPoint } from "@/app/components/sections/catalog-types";

export type PlaceStatus = "private" | "pending" | "approved" | "rejected";

/** What the member says the place is → the menu (collection) it is published in. The reviewer can change it. */
export const PLACE_KINDS = [
    { id: "beach", label: "Praia ou ilha", emoji: "🏖️", collection: "tourism-beaches" },
    { id: "park", label: "Parque, reserva ou miradouro", emoji: "🌿", collection: "tourism-parks" },
    { id: "restaurant", label: "Restaurante, café ou bar", emoji: "🍽️", collection: "gastronomy-restaurants" },
    { id: "lodging", label: "Alojamento", emoji: "🛏️", collection: "tourism-lodging" },
    { id: "shop", label: "Loja, mercado ou feira", emoji: "🛍️", collection: "services-commerce" },
    { id: "service", label: "Serviço ou profissional", emoji: "🛠️", collection: "services-general" },
    { id: "other", label: "Outro local", emoji: "📍", collection: "services-general" },
] as const;
export type PlaceKindId = (typeof PLACE_KINDS)[number]["id"];
export const kindOf = (id: string) => PLACE_KINDS.find((k) => k.id === id) ?? PLACE_KINDS[PLACE_KINDS.length - 1];

/** Menus where a suggested place can be published. */
export const PLACE_COLLECTIONS: string[] = [...new Set(PLACE_KINDS.map((k) => k.collection as string))];

export const STATUS_LABEL: Record<PlaceStatus, string> = {
    private: "Só para mim",
    pending: "Em revisão",
    approved: "Publicado",
    rejected: "Não aprovado",
};
export const STATUS_STYLE: Record<PlaceStatus, string> = {
    private: "bg-[#eef2f8] text-[#4b5568]",
    pending: "bg-[#ffc14d]/30 text-[#7a5200]",
    approved: "bg-[#35be12]/15 text-[#238a0c]",
    rejected: "bg-[#d23b25]/12 text-[#b5311d]",
};

export type MemberPlace = {
    id: string;
    memberId: string;
    name: string;
    kind: PlaceKindId;
    province?: string;
    address?: string;
    location?: GeoPoint;
    /** What the member writes for the public (also what the reviewer starts from) */
    description?: string;
    phone?: string;
    website?: string;
    /** /api/media/<year>/place-….jpg (up to 4) */
    photos: string[];
    /** Only for the member: never shown to the team or published */
    notes?: string;
    status: PlaceStatus;
    createdAt: string;
    updatedAt: string;
    submittedAt?: string;
    reviewedAt?: string;
    /** Reason given by the reviewer when a suggestion is not approved */
    reviewNote?: string;
    /** Where it was published */
    published?: { collection: string; slug: string };
};

export const MAX_PLACES = 100;
export const MAX_PHOTOS = 4;
export const PLACE_PHOTO_RE = /^\/api\/media\/\d{4}\/place-[a-z0-9]+\.(?:jpg|png|webp)$/;
