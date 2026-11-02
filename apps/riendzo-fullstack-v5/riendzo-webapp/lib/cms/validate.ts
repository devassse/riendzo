/**
 * Server-side validation / normalisation of everything coming from the editors.
 * The browser is never trusted: every field is trimmed, length-limited and
 * checked here before anything is stored.
 */
import {
    DAYS, type CatalogBlock, type CatalogContact, type CatalogItem, type CatalogPost, type CatalogVideo,
    type GeoPoint, type OfferGroup, type OpeningHours,
} from "@/app/components/sections/catalog-types";
import { TIME_RE } from "./hours";
import { validPoint } from "./geo";
import type { Recipe } from "@/app/[locale]/(pages)/gastronomia/receitas/recipes-grid";
import type { Album, Artist, PhotoAlbum, Track } from "./artist-types";
import { sanitizeHtml, youtubeId } from "./sanitize";
import { MAX_LINES, parseLrc } from "./lrc";
import type { LyricLine } from "./artist-types";

export type Errors = Record<string, string>;
export type Result<T> = { value?: T; errors: Errors };

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, maxItems: number, maxLen: number) =>
    Array.isArray(v) ? v.map((x) => str(x, maxLen)).filter(Boolean).slice(0, maxItems) : [];
const COLOR = /^#[0-9a-fA-F]{6}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const obj = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

export const slugify = (text: string) =>
    text
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80)
        .replace(/-+$/, "");

/** The address is never a reason to stop the form: derive it from the title (or generate one). */
const addressOf = (typed: string, title: string) => slugify(typed) || slugify(title) || `item-${Date.now().toString(36)}`;

/** Only http(s) links and site-relative paths: blocks javascript: and data: URLs. */
export const isSafeUrl = (v: string) =>
    (/^https?:\/\/[^\s]+$/i.test(v) || (/^\/[^\s/]/.test(v) && !v.includes(".."))) && v.length <= 500;

const images = (v: unknown) => list(v, 24, 500).filter(isSafeUrl);
const optUrl = (v: unknown) => {
    const s = str(v, 500);
    return s && isSafeUrl(s) ? s : undefined;
};
const status = (v: unknown): "published" | "draft" => (v === "draft" ? "draft" : "published");
const year = (v: unknown) => {
    const n = Math.round(Number(v));
    return n >= 1000 && n <= 2100 ? n : undefined;
};

export const canonicalYoutube = (url: string) => {
    const id = youtubeId(url);
    return id ? `https://www.youtube.com/watch?v=${id}` : null;
};

const todayIso = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Africa/Maputo" }).format(new Date());

function posts(v: unknown, errors: Errors): CatalogPost[] {
    const out: CatalogPost[] = [];
    (Array.isArray(v) ? v : []).slice(0, 100).forEach((x, i) => {
        const o = obj(x);
        const title = str(o.title, 120);
        const text = str(o.text, 3000);
        const imgs = images(o.images).slice(0, 12);
        const vids = videos(o.videos, errors);
        if (!title && !text && !imgs.length && !vids.length) return;
        if (!title) { errors.posts = `Publicação ${i + 1}: indique o título.`; return; }
        const date = /^\d{4}-\d{2}-\d{2}$/.test(String(o.date)) && !Number.isNaN(Date.parse(String(o.date))) ? String(o.date) : todayIso();
        out.push({ id: str(o.id, 40) || `p${Date.now().toString(36)}${i}`, title, date, text: text || undefined, images: imgs.length ? imgs : undefined, videos: vids.length ? vids.slice(0, 6) : undefined });
    });
    return out.sort((a, b) => b.date.localeCompare(a.date));
}

function videos(v: unknown, errors: Errors): CatalogVideo[] {
    const out: CatalogVideo[] = [];
    (Array.isArray(v) ? v : []).slice(0, 12).forEach((x, i) => {
        const o = obj(x);
        const url = str(o.url, 300);
        const title = str(o.title, 160);
        if (!url && !title) return;
        const canon = canonicalYoutube(url);
        if (!canon) {
            errors.videos = `Vídeo ${i + 1}: use um link do YouTube válido.`;
            return;
        }
        out.push({ title: title || "Vídeo", url: canon, creator: str(o.creator, 80) || undefined });
    });
    return out;
}

function contact(v: unknown, errors: Errors): CatalogContact | undefined {
    const o = obj(v);
    const c: CatalogContact = {};

    const phone = str(o.phone, 30);
    if (phone) {
        if (!/^[+0-9 ()-]{6,30}$/.test(phone)) errors.phone = "Telefone inválido.";
        else c.phone = phone;
    }

    let wa = str(o.whatsapp, 30).replace(/[^\d]/g, "");
    if (wa) {
        if (/^8\d{8}$/.test(wa)) wa = `258${wa}`; // 84 123 4567 -> 258841234567
        if (!/^\d{8,15}$/.test(wa)) errors.whatsapp = "WhatsApp inválido. Use o formato internacional, ex.: 258 84 123 4567.";
        else c.whatsapp = wa;
    }

    const email = str(o.email, 120);
    if (email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "E-mail inválido.";
        else c.email = email;
    }

    for (const key of ["website", "mapUrl", "facebook", "instagram"] as const) {
        const raw = str(o[key], 500);
        if (raw) {
            if (!/^https?:\/\//i.test(raw) || !isSafeUrl(raw)) errors[key] = "O link deve começar por http:// ou https://.";
            else c[key] = raw;
        }
    }
    const address = str(o.address, 200);
    if (address) c.address = address;

    // Any other social network: the BackOffice lets you add as many as needed
    const socials = (Array.isArray(o.socials) ? o.socials.slice(0, 12) : []).flatMap((x) => {
        const so = obj(x);
        const network = str(so.network, 30);
        const url = str(so.url, 500);
        if (!network && !url) return [];
        if (!network || !/^https?:\/\//i.test(url) || !isSafeUrl(url)) {
            errors.socials = "Cada rede social precisa de um nome e de um link que comece por http:// ou https://.";
            return [];
        }
        return [{ network, url }];
    });
    if (socials.length) c.socials = socials;

    return Object.keys(c).length ? c : undefined;
}

function location(v: unknown, errors: Errors): GeoPoint | undefined {
    const o = obj(v);
    const rawLat = String(o.lat ?? "").trim().replace(",", ".");
    const rawLng = String(o.lng ?? "").trim().replace(",", ".");
    if (!rawLat && !rawLng) return undefined;
    const p = { lat: Number(rawLat), lng: Number(rawLng) };
    if (!rawLat || !rawLng || !validPoint(p)) {
        errors.location = "Coordenadas inválidas. Latitude entre -90 e 90, longitude entre -180 e 180.";
        return undefined;
    }
    return { lat: Math.round(p.lat * 1e6) / 1e6, lng: Math.round(p.lng * 1e6) / 1e6 };
}

function hours(v: unknown, errors: Errors): OpeningHours | undefined {
    const o = obj(v);
    const out: OpeningHours = {};
    if (o.open24h === true) out.open24h = true;
    const note = str(o.note, 160);
    if (note) out.note = note;
    for (const d of DAYS) {
        const ranges = (Array.isArray(o[d]) ? (o[d] as unknown[]) : []).slice(0, 3).flatMap((r) => {
            const ro = obj(r);
            const open = str(ro.open, 5), close = str(ro.close, 5);
            if (!open && !close) return [];
            if (!TIME_RE.test(open) || !TIME_RE.test(close)) {
                errors.hours = "Horário inválido: use o formato 08:00.";
                return [];
            }
            return [{ open, close }];
        });
        if (ranges.length) out[d] = ranges;
    }
    return out.open24h || DAYS.some((d) => out[d]?.length) || out.note ? out : undefined;
}

function offers(v: unknown): OfferGroup[] | undefined {
    const groups = (Array.isArray(v) ? v : []).slice(0, 24).flatMap((g) => {
        const go = obj(g);
        const title = str(go.title, 100);
        const items = (Array.isArray(go.items) ? go.items : []).slice(0, 100).flatMap((it) => {
            const io = obj(it);
            const name = str(io.name, 140);
            if (!name) return [];
            const priceRaw = String(io.price ?? "").trim().replace(/\s/g, "").replace(",", ".");
            const price = priceRaw === "" ? undefined : Number(priceRaw);
            return [{
                name,
                description: str(io.description, 700) || undefined,
                tags: list(io.tags, 20, 60),
                price: price !== undefined && Number.isFinite(price) && price >= 0 && price <= 1e9 ? Math.round(price * 100) / 100 : undefined,
                priceNote: str(io.priceNote, 40) || undefined,
                images: images(io.images).slice(0, 8),
                available: io.available === false ? false : undefined,
                highlight: (["daily", "recommended", "popular"] as const).find((h) => h === io.highlight),
                until: /^\d{4}-\d{2}-\d{2}$/.test(String(io.until)) && !Number.isNaN(Date.parse(String(io.until))) ? String(io.until) : undefined,
            }];
        }).map((x) => ({ ...x, tags: x.tags.length ? x.tags : undefined, images: x.images.length ? x.images : undefined, until: x.highlight === "daily" ? x.until : undefined }));
        return items.length ? [{ title: title || "Geral", items }] : [];
    });
    return groups.length ? groups : undefined;
}

export function normalizeCatalog(raw: unknown): Result<CatalogItem> {
    const r = obj(raw);
    const errors: Errors = {};

    const title = str(r.title, 160);
    const slug = addressOf(str(r.slug, 120), title);
    // Establishments can operate in several provinces: `tag` is what the cards show
    const provinces = list(r.provinces, 12, 40);
    const tag = provinces.length ? (provinces.length <= 3 ? provinces.join(" · ") : "Várias províncias") : str(r.tag, 60);
    const summary = str(r.summary, 600);
    const categories = list(r.categories, 6, 40);
    const color = str(r.color, 7);
    const emoji = str(r.emoji, 8) || "✨";

    if (!title) errors.title = "Indique o título.";
    if (!SLUG.test(slug)) errors.slug = "Use só letras minúsculas, números e hífenes.";
    if (!tag) errors.tag = "Escolha a etiqueta.";
    if (!categories.length) errors.categories = "Escolha pelo menos uma categoria.";
    if (!summary) errors.summary = "Escreva um resumo.";
    if (!COLOR.test(color)) errors.color = "Escolha uma cor válida.";

    const facts = (Array.isArray(r.facts) ? r.facts : [])
        .map((f) => ({ label: str(obj(f).label, 60), value: str(obj(f).value, 300) }))
        .filter((f) => f.label && f.value)
        .slice(0, 12);

    const blocks: CatalogBlock[] = (Array.isArray(r.blocks) ? r.blocks : [])
        .map((b): CatalogBlock | null => {
            const o = obj(b);
            const heading = str(o.heading, 100);
            const items = list(o.items, 40, 1500);
            if (!items.length) return null;
            if (o.kind === "text") return { kind: "text", heading: heading || undefined, items };
            if (o.kind === "list" || o.kind === "steps" || o.kind === "tags") return { kind: o.kind, heading: heading || "Detalhes", items };
            return null;
        })
        .filter((b): b is CatalogBlock => b !== null)
        .slice(0, 8);

    const linkRaw = obj(r.link);
    const linkHref = str(linkRaw.href, 500);
    const linkLabel = str(linkRaw.label, 80);
    let link: CatalogItem["link"];
    if (linkHref || linkLabel) {
        if (!isSafeUrl(linkHref)) errors.link = "O link deve começar por http:// ou https://.";
        else link = { label: linkLabel || "Saber mais", href: linkHref };
    }

    const vids = videos(r.videos, errors);
    const postList = posts(r.posts, errors);
    const cont = contact(r.contact, errors);
    const loc = location(r.location, errors);
    const hrs = hours(r.hours, errors);
    const currency = (["MZN", "USD", "ZAR", "EUR"] as const).find((c) => c === r.currency);

    if (Object.keys(errors).length) return { errors };

    const body = sanitizeHtml(r.body);
    return {
        errors,
        value: {
            slug, title, tag, provinces: provinces.length ? provinces : undefined, showOnHome: r.showOnHome === true ? true : undefined,
            realm: r.realm === true ? true : undefined,
            bgTone: ["black", "green", "red", "yellow"].includes(String(r.bgTone)) ? (String(r.bgTone) as "black") : undefined,
            categories, color, emoji, summary,
            location: loc, hours: hrs, offers: offers(r.offers),
            currency: currency && currency !== "MZN" ? currency : undefined,
            meta: list(r.meta, 3, 80),
            facts, blocks,
            body: body || undefined,
            videos: vids.length ? vids : undefined,
            posts: postList.length ? postList : undefined,
            contact: cont,
            featured: r.featured === true ? true : undefined,
            tip: str(r.tip, 600) || undefined,
            tipLabel: str(r.tipLabel, 40) || undefined,
            link,
            keywords: list(r.keywords, 20, 40),
            images: images(r.images),
            status: status(r.status),
        },
    };
}

export function normalizeRecipe(raw: unknown, allowedCategories?: string[]): Result<Recipe> {
    const r = obj(raw);
    const errors: Errors = {};

    const name = str(r.name, 160);
    const slug = addressOf(str(r.slug, 120), name);
    const region = str(r.region, 60);
    const description = str(r.description, 600);
    const color = str(r.color, 7);
    const categories = list(r.categories, 6, 40).filter((c) => !allowedCategories || allowedCategories.includes(c));
    const ingredients = list(r.ingredients, 60, 200);
    const steps = list(r.steps, 40, 1000);
    const minutes = Math.round(Number(r.minutes));
    const servings = Math.round(Number(r.servings));
    const difficulty = r.difficulty === "medium" || r.difficulty === "hard" ? r.difficulty : "easy";

    if (!name) errors.name = "Indique o nome.";
    if (!SLUG.test(slug)) errors.slug = "Use só letras minúsculas, números e hífenes.";
    if (!region) errors.region = "Escolha a região.";
    if (!categories.length) errors.categories = "Escolha pelo menos uma categoria.";
    if (!description) errors.description = "Escreva uma descrição.";
    if (!COLOR.test(color)) errors.color = "Escolha uma cor válida.";
    if (!(minutes > 0 && minutes <= 2000)) errors.minutes = "Tempo inválido.";
    if (!(servings > 0 && servings <= 200)) errors.servings = "Porções inválidas.";
    if (!ingredients.length) errors.ingredients = "Adicione os ingredientes.";
    if (!steps.length) errors.steps = "Adicione os passos.";
    const vids = videos(r.videos, errors);

    if (Object.keys(errors).length) return { errors };

    const body = sanitizeHtml(r.body);
    return {
        errors,
        value: {
            slug, name, region, categories, color, minutes, servings, difficulty,
            description, ingredients, steps,
            body: body || undefined,
            videos: vids.length ? vids : undefined,
            tip: str(r.tip, 600) || undefined,
            images: images(r.images),
            status: status(r.status),
        },
    };
}

/* --------------------------------- Artist --------------------------------- */

const AUDIO = /\.(mp3|m4a|ogg|oga|wav|aac)(\?[^\s]*)?$/i;

const sec = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= 7200 ? Math.round(n * 100) / 100 : undefined;
};

/** Lyrics come from the editor as LRC text (or, if you import data, as an array). */
function lyricsOf(to: Record<string, unknown>): LyricLine[] | undefined {
    let lines: LyricLine[] = [];
    if (typeof to.lyricsLrc === "string") lines = parseLrc(to.lyricsLrc.slice(0, 40_000));
    else if (Array.isArray(to.lyrics)) {
        lines = to.lyrics.slice(0, MAX_LINES).map((l) => {
            const o = obj(l);
            const words = (Array.isArray(o.words) ? o.words : []).slice(0, 60).flatMap((w) => {
                const wo = obj(w), t = sec(wo.time), text = str(wo.text, 60);
                return t !== undefined && text ? [{ time: t, text }] : [];
            });
            return { time: sec(o.time), text: str(o.text, 200), ...(words.length ? { words } : {}) };
        });
    }
    while (lines.length && !lines[lines.length - 1].text && lines[lines.length - 1].time === undefined) lines.pop();
    return lines.some((l) => l.text) ? lines : undefined;
}

export function normalizeArtist(raw: unknown, genres?: string[]): Result<Artist> {
    const r = obj(raw);
    const errors: Errors = {};

    const name = str(r.name, 120);
    const slug = addressOf(str(r.slug, 120), name);
    // several styles allowed: `genre` is the main one (the first)
    const styles = [...new Set([...list(r.genres, 6, 40), str(r.genre, 40)].filter(Boolean))];
    const genre = styles[0] ?? "";
    const summary = str(r.summary, 500);

    if (!name) errors.name = "Indique o nome artístico.";
    if (!SLUG.test(slug)) errors.slug = "Use só letras minúsculas, números e hífenes.";
    if (!genre || (genres && styles.some((g) => !genres.includes(g)))) errors.genre = "Escolha pelo menos um estilo musical.";
    if (!summary) errors.summary = "Escreva um resumo curto.";

    const usedSlugs = new Set<string>();
    const albums: Album[] = (Array.isArray(r.albums) ? r.albums : []).slice(0, 40).flatMap((a, i) => {
        const o = obj(a);
        const title = str(o.title, 160);
        if (!title) return [];
        let base = slugify(title) || `album-${i + 1}`;
        let s = base;
        for (let n = 2; usedSlugs.has(s); n++) s = `${base}-${n}`;
        usedSlugs.add(s);

        const tracks: Track[] = (Array.isArray(o.tracks) ? o.tracks : []).slice(0, 80).flatMap((t) => {
            const to = obj(t);
            const tt = str(to.title, 160);
            if (!tt) return [];
            const audio = str(to.audioUrl, 500);
            if (audio && !(isSafeUrl(audio) && AUDIO.test(audio))) {
                errors.albums = `Faixa “${tt}”: o endereço de áudio deve terminar em .mp3, .m4a, .ogg, .wav ou .aac.`;
                return [];
            }
            const yt = str(to.youtubeUrl, 300);
            const ytCanon = yt ? canonicalYoutube(yt) : null;
            if (yt && !ytCanon) {
                errors.albums = `Faixa “${tt}”: link do YouTube inválido.`;
                return [];
            }
            const dur = str(to.duration, 8);
            return [{
                lyrics: lyricsOf(to),
                title: tt,
                duration: /^\d{1,2}:\d{2}$/.test(dur) ? dur : undefined,
                audioUrl: audio || undefined,
                youtubeUrl: ytCanon ?? undefined,
            }];
        });

        return [{
            slug: s, title, year: year(o.year), cover: optUrl(o.cover),
            label: str(o.label, 80) || undefined, description: str(o.description, 600) || undefined, tracks,
        }];
    });

    const photoAlbums: PhotoAlbum[] = (Array.isArray(r.photoAlbums) ? r.photoAlbums : []).slice(0, 12).flatMap((p) => {
        const o = obj(p);
        const title = str(o.title, 120);
        const imgs = (Array.isArray(o.images) ? o.images : []).slice(0, 60).flatMap((im) => {
            const io = obj(im);
            const src = optUrl(io.src);
            return src ? [{ src, caption: str(io.caption, 200) || undefined }] : [];
        });
        return title && imgs.length ? [{ title, images: imgs }] : [];
    });

    const lo = obj(r.links);
    const links: NonNullable<Artist["links"]> = {};
    for (const k of ["youtube", "spotify", "instagram", "facebook", "website"] as const) {
        const v = str(lo[k], 500);
        if (v) {
            if (!/^https?:\/\//i.test(v) || !isSafeUrl(v)) errors[`link-${k}`] = `Link de ${k} inválido.`;
            else links[k] = v;
        }
    }

    if (Object.keys(errors).length) return { errors };

    const body = sanitizeHtml(r.body);
    return {
        errors,
        value: {
            slug, name, genre, genres: styles.length > 1 ? styles : undefined, summary,
            realName: str(r.realName, 120) || undefined,
            photo: optUrl(r.photo), cover: optUrl(r.cover),
            birthYear: year(r.birthYear), deathYear: year(r.deathYear),
            origin: str(r.origin, 60) || undefined,
            activeSince: str(r.activeSince, 40) || undefined,
            quote: str(r.quote, 240) || undefined,
            body: body || undefined,
            albums, photoAlbums,
            links: Object.keys(links).length ? links : undefined,
            featuredWeek: r.featuredWeek === true ? true : undefined,
            status: status(r.status),
        },
    };
}
