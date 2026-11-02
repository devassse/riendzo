import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import pageStyles from "@/app/css/page.module.css";
import RiendzoNavbar from "@/app/components/navbar-hero-footer/riendzo-navbar";
import RiendzoFooter from "@/app/components/navbar-hero-footer/riendzo-footer";
import { getCollection, getGroup } from "@/lib/cms/collections";
import { getItem } from "@/lib/cms/store";
import { osmEmbedUrl } from "@/lib/cms/geo";
import { qrSvg } from "@/lib/cms/qr";
import { hasSchedule } from "@/lib/cms/hours";
import type { CatalogItem } from "./catalog-types";
import RichText from "./rich-text";
import VideoEmbed from "./video-embed";
import OffersView from "./offers-view";
import ContactButtons from "./contact-buttons";
import GalleryGrid from "./gallery-grid";
import { HoursTable, OpenPill } from "./open-status";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://riendzo.co.mz").replace(/\/$/, "");

/** Public address of an establishment, e.g. https://riendzo.co.mz/gastronomia/restaurantes/muzza */
export const establishmentUrl = (collectionPath: string, slug: string) => `${SITE_URL}${collectionPath}/${slug}`;

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="rounded-3xl border border-[#0b1220]/10 bg-white p-5 sm:p-6">
        <h2 className="font-baloo text-lg font-medium text-[#0b1220]">{title}</h2>
        <div className="mt-3">{children}</div>
    </section>
);

/**
 * Full page of one establishment (restaurant, hotel, bank, rent-a-car…).
 * Reached by the public link /<section>/<submenu>/<slug> (the QR code points here).
 */
export default async function EstablishmentPage({ collection, slug }: { collection: string; slug: string }) {
    const def = getCollection(collection);
    const item = (await getItem(collection, slug)) as CatalogItem | undefined;
    if (!def || !item || item.status === "draft") notFound();

    const t = await getTranslations("catalog");
    const group = getGroup(def.group);
    const url = establishmentUrl(def.publicPath, item.slug);
    const cover = item.images?.[0];
    const labels = {
        whatsapp: t("whatsapp"), call: t("call"), sendEmail: t("sendEmail"), website: t("website"),
        openMap: t("openMap"), directions: t("directions"),
    };
    const gallery = (item.images ?? []).map((src) => ({ src, caption: item.title }));
    const c = item.contact;

    return (
        <div className={pageStyles.page}>
            <RiendzoNavbar />

            <header className="relative overflow-hidden bg-[#0b1220] text-[#f4ecd8]">
                {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
                )}
                <div aria-hidden="true" className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${item.color}33 0%, #0b1220cc 85%)` }} />
                <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-8">
                    <nav aria-label="breadcrumb" className="text-xs text-[#f4ecd8]/70">
                        <Link href={group.publicPath} className="hover:underline">{group.label}</Link> /{" "}
                        <Link href={def.publicPath} className="hover:underline">{def.label}</Link>
                    </nav>
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-montserrat-italic uppercase tracking-[0.18em]" style={{ color: item.color }}>{item.tag}</span>
                        {item.categories.map((cat) => <span key={cat} className="rounded-full border border-white/30 px-3 py-1 text-xs">{cat}</span>)}
                        {item.featured && <span className="rounded-full bg-[#f0a83a] px-3 py-1 text-[10px] font-semibold uppercase text-[#3a2500]">★ {t("featured")}</span>}
                    </div>
                    <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-6xl">{item.title}</h1>
                    <p className="mt-4 max-w-2xl text-lg text-[#d9dfec]">{item.summary}</p>
                    {hasSchedule(item.hours) && <div className="mt-5"><OpenPill hours={item.hours} size="md" /></div>}
                    <div className="mt-6"><ContactButtons contact={c} location={item.location} name={item.title} labels={labels} color={item.color} /></div>
                </div>
            </header>

            <main className="bg-[#f6f8fc]">
                <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_21rem]">
                    <div className="min-w-0 space-y-6">
                        {(item.body || item.facts?.length || item.blocks?.length) && (
                            <Card title={t("about")}>
                                <RichText html={item.body} />
                                {item.facts?.length ? (
                                    <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                                        {item.facts.map((f) => (
                                            <div key={f.label} className="rounded-2xl border border-[#0b1220]/10 px-4 py-3">
                                                <dt className="text-[10px] font-montserrat-italic uppercase tracking-[0.18em]" style={{ color: item.color }}>{f.label}</dt>
                                                <dd className="mt-1 text-sm">{f.value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                ) : null}
                                {item.blocks?.map((b, i) => (
                                    <div key={i} className="mt-6">
                                        {b.heading && <h3 className="font-baloo text-base font-medium">{b.heading}</h3>}
                                        {b.kind === "list" && <ul className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">{b.items.map((x) => <li key={x} className="flex gap-2 text-sm"><span className="mt-2 h-1.5 w-1.5 flex-none rounded-full" style={{ backgroundColor: item.color }} />{x}</li>)}</ul>}
                                        {b.kind === "steps" && <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">{b.items.map((x) => <li key={x}>{x}</li>)}</ol>}
                                        {b.kind === "text" && <div className="mt-2 space-y-2 text-sm">{b.items.map((x) => <p key={x}>{x}</p>)}</div>}
                                        {b.kind === "tags" && <p className="mt-2 flex flex-wrap gap-2">{b.items.map((x) => <span key={x} className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: `${item.color}66` }}>{x}</span>)}</p>}
                                    </div>
                                ))}
                            </Card>
                        )}

                        {item.offers?.length ? (
                            <Card title={def.offers?.title ?? t("offersTitle")}>
                                <OffersView offers={item.offers} currency={item.currency} color={item.color} unavailable={t("unavailable")} />
                            </Card>
                        ) : null}

                        {gallery.length > 0 && <Card title={t("gallery")}><GalleryGrid images={gallery} alt={item.title} /></Card>}
                        {item.videos?.length ? <Card title={t("videos")}><VideoEmbed videos={item.videos} color={item.color} /></Card> : null}
                        {item.tip && <p className="rounded-2xl p-4 text-sm" style={{ backgroundColor: `${item.color}14` }}><b>{item.tipLabel ?? t("tip")}: </b>{item.tip}</p>}
                    </div>

                    <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
                        {hasSchedule(item.hours) && <Card title={t("schedule")}><HoursTable hours={item.hours} color={item.color} /></Card>}

                        {(item.location || c?.address) && (
                            <Card title={t("location")}>
                                {c?.address && <p className="mb-3 text-sm">{c.address}</p>}
                                {item.location && (
                                    <iframe
                                        title={`${t("location")}: ${item.title}`} src={osmEmbedUrl(item.location)} loading="lazy"
                                        className="h-52 w-full rounded-2xl border border-[#0b1220]/10" referrerPolicy="no-referrer"
                                    />
                                )}
                            </Card>
                        )}

                        {c && (c.phone || c.email || c.website || c.facebook || c.instagram) && (
                            <Card title={t("contact")}>
                                <ul className="space-y-1.5 text-sm">
                                    {c.phone && <li><a className="hover:underline" href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>📞 {c.phone}</a></li>}
                                    {c.email && <li><a className="hover:underline" href={`mailto:${c.email}`}>✉️ {c.email}</a></li>}
                                    {c.website && <li><a className="hover:underline" href={c.website} target="_blank" rel="noopener noreferrer">🌐 {c.website.replace(/^https?:\/\//, "")}</a></li>}
                                    {c.facebook && <li><a className="hover:underline" href={c.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></li>}
                                    {c.instagram && <li><a className="hover:underline" href={c.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>}
                                </ul>
                            </Card>
                        )}

                        <Card title={t("share")}>
                            <div className="mx-auto w-40 overflow-hidden rounded-xl border border-[#0b1220]/10" dangerouslySetInnerHTML={{ __html: qrSvg(url, { margin: 2 }) }} aria-label={`QR Code: ${url}`} role="img" />
                            <p className="mt-3 break-all text-center text-xs text-[#5b6478]">{url}</p>
                            <p className="mt-1 text-center text-[11px] text-[#5b6478]">{t("scanQr")}</p>
                        </Card>
                    </aside>
                </div>
            </main>
            <RiendzoFooter />
        </div>
    );
}
