import Link from "next/link";
import { COLLECTIONS, GROUPS, collectionsOf, getCollection } from "@/lib/cms/collections";
import { getActivity, getRecentItems, getStats, titleOf } from "@/lib/cms/store";
import {
    IconFilm, IconBook, IconNews, IconPalm, IconPot,
} from "@/app/components/utils/riendzo-icons";

const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });

const Svg = ({ d, className = "h-7 w-7" }: { d: string; className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

function Stat({ icon, value, label, color, href }: { icon: string; value: number; label: string; color: string; href: string }) {
    return (
        <Link href={href} className="group flex items-center gap-4 rounded-2xl border border-[#0b1220]/8 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl" style={{ background: `${color}1a`, color }}>
                <Svg d={icon} />
            </span>
            <span className="flex-1">
                <span className="block font-baloo text-3xl font-bold leading-none">{value.toLocaleString("pt-PT")}</span>
                <span className="text-sm text-[#4b5568]">{label}</span>
            </span>
            <Svg d="M9 6l6 6-6 6" className="h-4 w-4 text-[#6b7588] transition-transform group-hover:translate-x-0.5" />
        </Link>
    );
}

const QUICK = [
    { group: "gastronomy", label: "Gastronomia", color: "#e5533d", Icon: IconPot },
    { group: "tourism", label: "Turismo", color: "#0370d6", Icon: IconPalm },
    { group: "services", label: "Serviços Públicos", color: "#2f9e44", Icon: IconBook },
    { group: "entertainment", label: "Entretenimento", color: "#a85bd6", Icon: IconFilm },
    { group: "blog", label: "Blog", color: "#d98a00", Icon: IconNews },
] as const;

export default async function Dashboard() {
    const [stats, activity, recent] = await Promise.all([getStats(), getActivity(), getRecentItems(3)]);

    const total = stats.reduce((n, s) => n + s.total, 0);
    const published = stats.reduce((n, s) => n + s.published, 0);
    const drafts = stats.reduce((n, s) => n + s.drafts, 0);
    const noImages = stats.reduce((n, s) => n + s.withoutImages, 0);
    const maxTotal = Math.max(1, ...stats.map((s) => s.total));
    const countOf = (g: string) => collectionsOf(g as never).reduce((n, c) => n + (stats.find((s) => s.id === c.id)?.total ?? 0), 0);

    return (
        <div className="mx-auto max-w-[88rem]">
            {/* Welcome banner */}
            <section className="relative h-[17rem] overflow-hidden rounded-3xl bg-gradient-to-r from-[#00306e] via-[#0054b5] to-[#0370d6] text-white shadow-sm sm:h-[19rem]">
                <div aria-hidden="true" className="absolute right-[17%] top-0 hidden h-full w-[46%] md:block" style={{ clipPath: "polygon(16% 0, 100% 0, 84% 100%, 0 100%)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/home/maputo_baixa.jpg" alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00306e]/75 via-transparent to-transparent" />
                </div>
                <div aria-hidden="true" className="absolute right-0 top-0 hidden h-full w-[26%] bg-gradient-to-b from-[#01adfb] to-[#0370d6] lg:block" style={{ clipPath: "polygon(24% 0, 100% 0, 100% 100%, 0 100%)" }} />

                <div className="relative z-10 flex h-full max-w-xl flex-col justify-center px-7 sm:px-12">
                    <p className="text-xs font-medium uppercase tracking-[0.4em] text-white/80">Bem-vindo ao</p>
                    <h1 className="mt-2 font-baloo text-4xl font-bold leading-tight sm:text-5xl">Portal do Administrador</h1>
                    <p className="mt-3 max-w-md text-base leading-snug text-white/85 sm:text-lg">
                        O seu centro de controlo para todo o conteúdo da plataforma Riendzo.
                    </p>
                    <span className="mt-5 block h-1 w-14 rounded-full bg-[#01adfb]" />
                    <p className="mt-4 text-sm text-white/85">Turismo • Gastronomia • Serviços • Entretenimento • Blog</p>
                </div>

                <div className="absolute bottom-6 right-6 z-10 hidden w-[20%] text-center lg:block">
                    <p className="font-baloo text-2xl font-medium italic leading-tight">Descubra Moçambique, juntos.</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brand/riendzo-logo-white.png" alt="Riendzo" className="mx-auto mt-4 w-40" />
                </div>
            </section>

            {/* Numbers */}
            <section aria-label="Resumo" className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat icon="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" value={total} label={`Conteúdos em ${COLLECTIONS.length} menus`} color="#0054b5" href="#menus" />
                <Stat icon="M5 12l5 5L20 7" value={published} label="Publicados no site" color="#2f9e44" href="#menus" />
                <Stat icon="M4 20h4L19 9l-4-4L4 16zM13 7l4 4" value={drafts} label="Rascunhos por publicar" color="#d98a00" href="#menus" />
                <Stat icon="M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M9 9h.01" value={noImages} label="Sem fotografia" color="#e5533d" href="/admin/media" />
            </section>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
                <div className="min-w-0 space-y-6">
                    {/* Quick access */}
                    <section>
                        <h2 className="font-baloo text-xl font-bold">Acesso Rápido</h2>
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                            {QUICK.map(({ group, label, color, Icon }) => {
                                const first = collectionsOf(group)[0];
                                return (
                                    <Link key={group} href={`/admin/c/${first.id}`} className="flex flex-col items-center rounded-2xl px-3 py-5 text-center transition-transform hover:-translate-y-0.5" style={{ background: `${color}1c`, color }}>
                                        <Icon className="h-8 w-8" />
                                        <span className="mt-3 text-sm font-medium leading-tight">{label}</span>
                                        <span className="mt-0.5 text-[11px] opacity-80">{countOf(group)} conteúdos</span>
                                    </Link>
                                );
                            })}
                            <Link href="/admin/media" className="flex flex-col items-center rounded-2xl px-3 py-5 text-center transition-transform hover:-translate-y-0.5" style={{ background: "#01adfb1c", color: "#0079b3" }}>
                                <Svg d="M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M9 9h.01" className="h-8 w-8" />
                                <span className="mt-3 text-sm font-medium leading-tight">Biblioteca de media</span>
                                <span className="mt-0.5 text-[11px] opacity-80">Imagens</span>
                            </Link>
                        </div>
                    </section>

                    {/* Recent content */}
                    <section>
                        <div className="flex items-center justify-between">
                            <h2 className="font-baloo text-xl font-bold">Conteúdos Recentes</h2>
                            <Link href="/admin/c/blog-news" className="text-sm font-medium text-[#0054b5] hover:underline">Ver todos ›</Link>
                        </div>
                        <div className="mt-3 grid gap-4 md:grid-cols-3">
                            {recent.map(({ collection, item }) => {
                                const c = getCollection(collection)!;
                                const emoji = "emoji" in item ? item.emoji : "🍽️";
                                const summary = "summary" in item ? item.summary : item.description;
                                return (
                                    <Link key={`${collection}-${item.slug}`} href={`/admin/c/${collection}/${item.slug}`} className="flex gap-3 rounded-2xl border border-[#0b1220]/8 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                                        <span className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-xl text-2xl" style={{ background: `${item.color}22` }}>
                                            {item.images?.[0]
                                                // eslint-disable-next-line @next/next/no-img-element
                                                ? <img src={item.images[0]} alt="" className="h-full w-full object-cover" />
                                                : emoji}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate font-baloo text-[15px] font-medium leading-tight">{titleOf(item)}</span>
                                            <span className="mt-1 line-clamp-2 block text-xs text-[#4b5568]">{summary}</span>
                                            <span className="mt-2 block text-[11px] text-[#6b7588]">
                                                {c.label} · {item.status === "draft" ? "Rascunho" : "Publicado"} · {item.updatedAt ? fmt(item.updatedAt) : "Conteúdo inicial"}
                                            </span>
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* Per menu */}
                    <section id="menus" className="scroll-mt-24">
                        <h2 className="font-baloo text-xl font-bold">Estado por menu</h2>
                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                            {GROUPS.map((g) => (
                                <div key={g.id} className="rounded-2xl border border-[#0b1220]/8 bg-white p-5 shadow-sm">
                                    <h3 className="flex items-center justify-between font-baloo text-base font-medium">
                                        <span>{g.emoji} {g.label}</span>
                                        <span className="text-xs font-normal text-[#4b5568]">{countOf(g.id)} conteúdos</span>
                                    </h3>
                                    <ul className="mt-3 space-y-3">
                                        {collectionsOf(g.id).map((c) => {
                                            const s = stats.find((x) => x.id === c.id)!;
                                            return (
                                                <li key={c.id}>
                                                    <div className="flex items-center justify-between gap-2 text-sm">
                                                        <Link href={`/admin/c/${c.id}`} className="font-medium hover:underline">{c.label}</Link>
                                                        <span className="flex items-center gap-2 text-xs text-[#4b5568]">
                                                            {s.drafts > 0 && <span className="rounded-full bg-[#ffc14d]/30 px-2 py-0.5 text-[#8a5a00]">{s.drafts} rasc.</span>}
                                                            {s.total}
                                                            <Link href={`/admin/c/${c.id}/new`} aria-label={`Novo em ${c.label}`} className="rounded-full border border-[#0b1220]/15 px-2 hover:bg-[#eef2f8]">+</Link>
                                                        </span>
                                                    </div>
                                                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e6ebf3]" role="img" aria-label={`${s.total} conteúdos`}>
                                                        <div className="h-full rounded-full" style={{ width: `${(s.total / maxTotal) * 100}%`, backgroundColor: c.color }} />
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right column */}
                <aside className="space-y-5">
                    <section className="rounded-2xl border border-[#0b1220]/8 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="font-baloo text-lg font-bold">Novidades</h2>
                            <span className="text-xs font-medium text-[#0054b5]">Atividade</span>
                        </div>
                        {activity.length === 0 ? (
                            <p className="mt-3 text-sm text-[#4b5568]">Ainda sem atividade. Crie ou edite um conteúdo para começar.</p>
                        ) : (
                            <ol className="mt-4 space-y-4">
                                {activity.slice(0, 6).map((a, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className={`mt-1.5 h-2.5 w-2.5 flex-none rounded-full ${i === 0 ? "bg-[#0054b5]" : "bg-[#b4bccb]"}`} />
                                        <span className="min-w-0 text-sm">
                                            <span className="block font-medium leading-snug">{a.action}{a.title && <> “{a.title}”</>}</span>
                                            <span className="text-xs text-[#6b7588]">{a.user} · {fmt(a.at)}{a.collection && <> · {getCollection(a.collection)?.label}</>}</span>
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>

                    <section className="relative flex h-44 items-end overflow-hidden rounded-2xl bg-[#0b1220] p-5 text-white shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/home/bazaruto.jpeg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#001b40] via-[#001b40]/40 to-transparent" />
                        <p className="relative font-baloo text-xl font-medium leading-tight">
                            “Moçambique ao alcance de um clique”
                            <span className="mt-1 block text-sm font-normal text-white/85">Riendzo</span>
                        </p>
                    </section>
                </aside>
            </div>
        </div>
    );
}
