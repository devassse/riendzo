/**
 * Allow-list HTML sanitiser for the rich-text editor (no dependencies).
 *
 * It does NOT try to "clean" dangerous HTML: it tokenises the input and
 * re-builds the output from scratch, keeping only known tags, known
 * attributes and validated URLs. Everything else is dropped or escaped.
 * Used when saving AND again when rendering.
 */

const VOID = new Set(["br", "hr", "img"]);
const TAGS: Record<string, string[]> = {
    p: [], h2: [], h3: [], h4: [], strong: [], em: [], u: [], s: [], br: [], hr: [],
    ul: [], ol: [], li: [], blockquote: [], figure: [], figcaption: [], code: [], pre: [],
    a: ["href", "title"], img: ["src", "alt", "title"], iframe: ["src", "title"],
};
const RENAME: Record<string, string> = { b: "strong", i: "em", strike: "s", del: "s", h1: "h2", h5: "h4", h6: "h4" };
const DROP_WITH_CONTENT = /<(script|style|noscript|template|object|embed|svg|math|textarea|select)\b[\s\S]*?<\/\1\s*>/gi;

const YT = /^https:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{11})(?:[?#].*)?$/;

const escText = (t: string) =>
    t.replace(/&(?!(?:#\d{1,6}|#x[0-9a-fA-F]{1,5}|[a-zA-Z]{2,8});)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (t: string) => escText(t).replace(/"/g, "&quot;");
const decodeAmp = (v: string) => v.replace(/&amp;/g, "&").trim();

function safeHref(v: string) {
    const u = decodeAmp(v);
    if (/^(https?:\/\/|mailto:|tel:)[^\s]+$/i.test(u) || /^\/(?!\/)[^\s]*$/.test(u) || /^#[\w-]+$/.test(u)) {
        return u.length <= 600 && !u.includes("..") ? u : null;
    }
    return null;
}
function safeSrc(v: string) {
    const u = decodeAmp(v);
    if (/^https:\/\/[^\s]+$/i.test(u) || /^\/(?!\/)[^\s]*$/.test(u)) return u.length <= 600 && !u.includes("..") ? u : null;
    return null;
}

function parseAttrs(raw: string) {
    const out: Record<string, string> = {};
    const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw))) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
    return out;
}

export function sanitizeHtml(input: unknown, maxLength = 120_000): string {
    if (typeof input !== "string") return "";
    const html = input.slice(0, maxLength).replace(/<!--[\s\S]*?-->/g, "").replace(DROP_WITH_CONTENT, "");

    const out: string[] = [];
    const stack: string[] = [];
    const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
    let last = 0;
    let m: RegExpExecArray | null;

    const closeTo = (name: string) => {
        const idx = stack.lastIndexOf(name);
        if (idx < 0) return;
        while (stack.length > idx) out.push(`</${stack.pop()}>`);
    };

    while ((m = re.exec(html))) {
        out.push(escText(html.slice(last, m.index)));
        last = re.lastIndex;

        const closing = m[1] === "/";
        let name = m[2].toLowerCase();
        name = RENAME[name] ?? name;
        if (!(name in TAGS)) continue;

        if (closing) {
            if (!VOID.has(name)) closeTo(name);
            continue;
        }

        const attrs = parseAttrs(m[3]);
        let rendered = `<${name}`;

        if (name === "a") {
            const href = attrs.href ? safeHref(attrs.href) : null;
            if (!href) continue; // a link without a valid target is just text
            rendered += ` href="${escAttr(href)}"`;
            if (attrs.title) rendered += ` title="${escAttr(attrs.title.slice(0, 200))}"`;
            if (/^https?:/i.test(href)) rendered += ` target="_blank" rel="noopener noreferrer"`;
        } else if (name === "figure") {
            // image size chosen in the editor: only 25, 50, 75 or 100 (%)
            const size = /^(25|50|75|100)$/.exec(attrs["data-size"] ?? "")?.[1];
            if (size) rendered += ` data-size="${size}"`;
        } else if (name === "img") {
            const src = attrs.src ? safeSrc(attrs.src) : null;
            if (!src) continue;
            rendered += ` src="${escAttr(src)}" alt="${escAttr((attrs.alt ?? "").slice(0, 300))}" loading="lazy"`;
            if (attrs.title) rendered += ` title="${escAttr(attrs.title.slice(0, 200))}"`;
        } else if (name === "iframe") {
            const yt = attrs.src ? YT.exec(decodeAmp(attrs.src)) : null;
            if (!yt) continue;
            rendered += ` src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="${escAttr((attrs.title ?? "Vídeo").slice(0, 200))}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"`;
        }

        rendered += ">";
        out.push(rendered);
        if (!VOID.has(name)) stack.push(name);
    }
    out.push(escText(html.slice(last)));
    while (stack.length) out.push(`</${stack.pop()}>`);

    return out.join("").trim();
}

/** Plain text of some HTML (for excerpts and for checking that it isn't empty). */
export function htmlToText(html: string | undefined) {
    return (html ?? "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
}

export const hasContent = (html: string | undefined) =>
    htmlToText(html).length > 0 || /<(img|iframe)\b/i.test(html ?? "");

/* ---------------------------- YouTube helpers ---------------------------- */

/** Returns the 11-char video id of a YouTube link, or null. */
export function youtubeId(url: string): string | null {
    const m =
        /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#/].*)?$/.exec(
            url.trim()
        );
    return m ? m[1] : null;
}
