/**
 * Search box + pagination shared by the Administrador lists (Membros, Subscrições, Utilizadores,
 * Mensagens, Doações, Pedidos). Plain links and GET forms: works without JavaScript and the
 * address can be bookmarked or shared.
 */

export const PAGE_SIZE = 20;

/** Accent-insensitive "contains" for searches. */
export const norm = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
export const matches = (q: string, ...fields: (string | number | undefined | null)[]) => {
    const n = norm(q);
    if (!n) return true;
    const hay = norm(fields.filter((f) => f !== undefined && f !== null).join(" "));
    return n.split(/\s+/).every((w) => hay.includes(w));
};

/** The slice for the current page. */
export function paginate<T>(list: T[], page: string | undefined, size = PAGE_SIZE) {
    const pages = Math.max(1, Math.ceil(list.length / size));
    const cur = Math.min(Math.max(1, Number(page) || 1), pages);
    return { items: list.slice((cur - 1) * size, cur * size), cur, pages, total: list.length, from: list.length ? (cur - 1) * size + 1 : 0, to: Math.min(cur * size, list.length) };
}

const qs = (params: Record<string, string | undefined>, page?: number) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") u.set(k, v);
    if (page && page > 1) u.set("page", String(page));
    const s = u.toString();
    return s ? `?${s}` : "?";
};

/** Search field (same look as in "Membros Riendzo AI"). `keep` = other filters to keep when searching. */
/** A query-string value that may come as several (?x=a&x=b): the first one, or "". */
export const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? "";

export function SearchBox({ q, placeholder, keep = {}, children }: { q: string; placeholder: string; keep?: Record<string, string | undefined>; children?: React.ReactNode }) {
    return (
        <form role="search" className="mb-4 flex flex-wrap items-center gap-2">
            {Object.entries(keep).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
            <span className="relative w-full max-w-md">
                <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b6478]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.3-4.3" /></svg>
                <input name="q" type="search" defaultValue={q} placeholder={placeholder} aria-label={placeholder} className="w-full rounded-full border border-[#0b1220]/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#0370d6]" />
            </span>
            {children}
            <button className="cursor-pointer rounded-full bg-[#0054b5] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90">Pesquisar</button>
            {q && <a href={qs({ ...keep })} className="text-sm text-[#0054b5] hover:underline">Limpar</a>}
        </form>
    );
}

/** "1–20 de 57" + previous / numbered pages / next. */
export function Pager({ cur, pages, total, from, to, params }: { cur: number; pages: number; total: number; from: number; to: number; params: Record<string, string | undefined> }) {
    if (total === 0) return null;
    // a short window of page numbers around the current one
    const nums = [...new Set([1, cur - 2, cur - 1, cur, cur + 1, cur + 2, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
    const link = "flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm";
    return (
        <nav aria-label="Paginação" className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#5b6478]">{from}–{to} de {total}</p>
            {pages > 1 && (
                <ul className="flex flex-wrap items-center gap-1">
                    <li>{cur > 1 ? <a href={qs(params, cur - 1)} className={`${link} border border-[#0b1220]/15 bg-white hover:bg-[#eef2f8]`}>← Anterior</a> : <span className={`${link} text-[#9aa3b2]`}>← Anterior</span>}</li>
                    {nums.map((n, i) => (
                        <li key={n} className="flex items-center gap-1">
                            {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-[#9aa3b2]">…</span>}
                            {n === cur ? <span aria-current="page" className={`${link} bg-[#0054b5] font-medium text-white`}>{n}</span> : <a href={qs(params, n)} className={`${link} hover:bg-[#eef2f8]`}>{n}</a>}
                        </li>
                    ))}
                    <li>{cur < pages ? <a href={qs(params, cur + 1)} className={`${link} border border-[#0b1220]/15 bg-white hover:bg-[#eef2f8]`}>Seguinte →</a> : <span className={`${link} text-[#9aa3b2]`}>Seguinte →</span>}</li>
                </ul>
            )}
        </nav>
    );
}
