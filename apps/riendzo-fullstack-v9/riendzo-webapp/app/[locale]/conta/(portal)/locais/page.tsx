import { Link } from "@/i18n/navigation";
import { requireMember } from "@/app/actions/member-actions";
import { listPlacesOf } from "@/lib/places";
import { kindOf, STATUS_LABEL, STATUS_STYLE } from "@/lib/place-types";

export const dynamic = "force-dynamic";

const MSG: Record<string, string> = { eliminado: "Local eliminado." };

export default async function MyPlaces({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
    const m = await requireMember("/conta/locais");
    const { ok } = await searchParams;
    const places = await listPlacesOf(m.id);

    return (
        <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="font-baloo text-3xl font-bold">Os meus locais</h1>
                    <p className="mt-1 text-sm text-[#4b5568]">Guarde os seus lugares no perfil. Se quiser, sugira-os à Riendzo para ficarem disponíveis a todos.</p>
                </div>
                <Link href="/conta/locais/novo" className="rounded-full bg-[#0054b5] px-5 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90">＋ Novo local</Link>
            </div>

            {ok && MSG[ok] && <p role="status" className="mt-4 rounded-2xl bg-[#2f9e44]/12 px-4 py-3 text-sm text-[#237a35]">{MSG[ok]}</p>}

            {places.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-10 text-center">
                    <p className="text-4xl" aria-hidden="true">📍</p>
                    <p className="mt-2 font-baloo text-lg font-bold">Ainda não guardou nenhum local</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-[#4b5568]">Aquela praia escondida, o restaurante de que gosta, o mecânico de confiança… guarde-os aqui e partilhe os melhores com a comunidade.</p>
                    <Link href="/conta/locais/novo" className="mt-4 inline-block rounded-full bg-[#0054b5] px-5 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90">Guardar o primeiro local</Link>
                </div>
            ) : (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {places.map((p) => {
                        const k = kindOf(p.kind);
                        return (
                            <li key={p.id}>
                                <Link href={`/conta/locais/${p.id}`} className="flex items-center gap-3 rounded-2xl border border-[#0b1220]/8 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                                    <span className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-xl bg-[#eef2f8] text-3xl">
                                        {p.photos[0] /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={p.photos[0]} alt="" className="h-full w-full object-cover" /> : k.emoji}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-baloo font-medium">{p.name}</span>
                                        <span className="block truncate text-xs text-[#4b5568]">{k.label}{p.province ? ` · ${p.province}` : ""}</span>
                                        <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
