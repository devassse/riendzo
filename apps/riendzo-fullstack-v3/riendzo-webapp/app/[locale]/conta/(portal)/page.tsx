import { Link } from "@/i18n/navigation";
import { requireMember } from "@/app/actions/member-actions";
import { COLLECTIONS, GROUPS, collectionsOf, getCollection, portalUrlOf } from "@/lib/cms/collections";
import { getItem, imagesOf, emojiOf, summaryOf, titleOf } from "@/lib/cms/store";
import { recommendFor } from "@/lib/recommend";

export default async function PortalHome() {
    const m = await requireMember("/conta");
    const recs = await recommendFor(m);
    const favs = (await Promise.all(m.favorites.slice(0, 4).map(async (f) => ({ f, item: await getItem(f.collection, f.slug) })))).filter((x) => x.item);

    const checks = [m.avatar, m.bio, m.province, m.birthYear, (m.travelStyles?.length ?? (m.travelStyle ? 1 : 0)), m.languages.length, m.interests.length];
    const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

    return (
        <div className="mx-auto max-w-[88rem]">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00306e] via-[#0054b5] to-[#0370d6] px-7 py-10 text-white shadow-sm sm:px-12">
                <div aria-hidden="true" className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#01adfb]/30 blur-3xl" />
                <p className="relative text-xs font-medium uppercase tracking-[0.4em] text-white/80">Bem-vindo(a)</p>
                <h1 className="relative mt-2 font-baloo text-4xl font-bold sm:text-5xl">Olá, {m.firstName}!</h1>
                <p className="relative mt-3 max-w-xl text-lg text-white/85">Explore tudo o que a Riendzo reúne sobre Moçambique, guarde os seus favoritos e receba sugestões feitas à sua medida.</p>
                <div className="relative mt-6 max-w-sm">
                    <div className="flex justify-between text-xs text-white/85"><span>Perfil completo</span><span>{pct}%</span></div>
                    <div className="mt-1.5 h-2 rounded-full bg-white/25"><div className="h-full rounded-full bg-[#01adfb]" style={{ width: `${pct}%` }} /></div>
                    {pct < 100 && <Link href="/conta/perfil" className="mt-2 inline-block text-sm font-medium underline">Completar o meu perfil →</Link>}
                </div>
            </section>

            <section className="mt-6">
                <h2 className="font-baloo text-xl font-bold">Explorar</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                    {GROUPS.map((g) => (
                        <Link key={g.id} href={`/conta/explorar/${collectionsOf(g.id)[0].id}`} className="flex flex-col items-center rounded-2xl border border-[#0b1220]/8 bg-white px-3 py-5 text-center shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
                            <span className="text-3xl" aria-hidden="true">{g.emoji}</span>
                            <span className="mt-2 text-sm font-medium">{g.label}</span>
                            <span className="text-[11px] text-[#5b6478]">{collectionsOf(g.id).length} secções</span>
                        </Link>
                    ))}
                </div>
            </section>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <section>
                    <h2 className="font-baloo text-xl font-bold">Sugestões para si</h2>
                    {recs.length === 0 ? (
                        <p className="mt-3 rounded-2xl border border-dashed border-[#0b1220]/20 bg-white p-6 text-sm text-[#4b5568]">Escolha os seus interesses e a sua província no <Link href="/conta/perfil" className="font-medium text-[#0054b5] underline">perfil</Link> para receber sugestões.</p>
                    ) : (
                        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                            {recs.map(({ collection, item }) => (
                                <li key={`${collection}-${item.slug}`}>
                                    <Link href={portalUrlOf(collection, item.slug)} className="flex gap-3 rounded-2xl border border-[#0b1220]/8 bg-white p-4 shadow-sm hover:shadow-md">
                                        <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl text-2xl" style={{ background: `${item.color}22` }}>{item.emoji}</span>
                                        <span className="min-w-0"><span className="block truncate font-baloo font-medium">{item.title}</span><span className="line-clamp-2 text-xs text-[#4b5568]">{item.summary}</span><span className="mt-1 block text-[11px] text-[#6b7588]">{getCollection(collection)?.label}</span></span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <aside className="space-y-5">
                    <section className="rounded-2xl border border-[#0b1220]/8 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between"><h2 className="font-baloo text-lg font-bold">Favoritos</h2><Link href="/conta/favoritos" className="text-sm font-medium text-[#0054b5]">Ver todos ›</Link></div>
                        {favs.length === 0 ? <p className="mt-3 text-sm text-[#4b5568]">Toque no ♥ de qualquer cartão para guardar aqui.</p> : (
                            <ul className="mt-3 space-y-3">
                                {favs.map(({ f, item }) => (
                                    <li key={`${f.collection}-${f.slug}`}><Link href={portalUrlOf(f.collection, f.slug)} className="flex items-center gap-3 text-sm hover:underline"><span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-[#eef2f8]">{imagesOf(item!)[0] /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={imagesOf(item!)[0]} alt="" className="h-full w-full object-cover" /> : emojiOf(item!)}</span><span className="truncate">{titleOf(item!)}</span></Link></li>
                                ))}
                            </ul>
                        )}
                    </section>
                    <section className="relative overflow-hidden rounded-2xl bg-[#0b1220] p-5 text-white shadow-sm">
                        <p className="text-[10px] font-montserrat-italic uppercase tracking-[0.18em] text-[#01adfb]">Em breve</p>
                        <h2 className="mt-1 font-baloo text-lg font-bold">Riendzo AI</h2>
                        <p className="mt-1 text-sm text-white/80">Vamos usar inteligência artificial para sugerir praias, receitas, música e serviços de acordo com os seus favoritos.</p>
                    </section>
                </aside>
            </div>
        </div>
    );
}
