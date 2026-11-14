import Link from "next/link";
import { requireAdmin } from "@/lib/cms/auth";
import { listSuggestions } from "@/lib/places";
import { listMembers } from "@/lib/members";
import { getCollection, publicUrlOf } from "@/lib/cms/collections";
import { kindOf, STATUS_LABEL, STATUS_STYLE, type PlaceStatus } from "@/lib/place-types";

export const dynamic = "force-dynamic";

const TABS: { id: string; status: PlaceStatus; label: string }[] = [
    { id: "pendente", status: "pending", label: "Por rever" },
    { id: "aprovado", status: "approved", label: "Aprovados" },
    { id: "rejeitado", status: "rejected", label: "Não aprovados" },
];

export default async function SuggestedPlaces({ searchParams }: { searchParams: Promise<{ estado?: string; ok?: string; ref?: string }> }) {
    await requireAdmin();
    const { estado = "pendente", ok, ref } = await searchParams;
    const tab = TABS.find((t) => t.id === estado) ?? TABS[0];
    const [all, members] = await Promise.all([listSuggestions(), listMembers()]);
    const who = new Map(members.map((m) => [m.id, `${m.firstName} ${m.lastName}`]));
    const counts = Object.fromEntries(TABS.map((t) => [t.status, all.filter((p) => p.status === t.status).length]));
    const rows = all.filter((p) => p.status === tab.status);
    const [refCollection, refSlug] = (ref ?? "").split("/");

    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="font-baloo text-3xl font-bold">Locais sugeridos</h1>
            <p className="mb-5 mt-1 text-sm text-[#4b5568]">Locais que os membros guardaram no perfil e quiseram partilhar. Reveja, ajuste a informação e publique.</p>

            {ok === "aprovado" && (
                <p role="status" className="mb-4 rounded-2xl bg-[#2f9e44]/12 px-4 py-3 text-sm text-[#237a35]">
                    Local publicado e membro avisado por e-mail.{" "}
                    {getCollection(refCollection) && refSlug && <Link href={`/admin/c/${refCollection}/${refSlug}`} className="font-medium underline">Abrir no editor completo (horários, galeria…)</Link>}
                </p>
            )}
            {ok === "rejeitado" && <p role="status" className="mb-4 rounded-2xl bg-[#2f9e44]/12 px-4 py-3 text-sm text-[#237a35]">Sugestão não aprovada. O membro foi informado do motivo.</p>}

            <div className="mb-4 flex flex-wrap gap-2" role="tablist">
                {TABS.map((t) => (
                    <Link key={t.id} href={`/admin/locais-sugeridos?estado=${t.id}`} role="tab" aria-selected={t.id === tab.id}
                        className={`rounded-full px-4 py-1.5 text-sm ${t.id === tab.id ? "bg-[#0054b5] text-white" : "border border-[#0b1220]/15 bg-white hover:bg-[#eef2f8]"}`}>
                        {t.label} <span className={`ml-1 text-xs ${t.id === tab.id ? "text-white/80" : "text-[#5b6478]"}`}>{counts[t.status]}</span>
                    </Link>
                ))}
            </div>

            {rows.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-10 text-center text-sm text-[#4b5568]">
                    {tab.status === "pending" ? "Não há sugestões por rever. 🎉" : "Nada nesta lista."}
                </p>
            ) : (
                <ul className="grid gap-3">
                    {rows.map((p) => {
                        const k = kindOf(p.kind);
                        return (
                            <li key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#0b1220]/8 bg-white p-3 shadow-sm">
                                <span className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-xl bg-[#eef2f8] text-3xl">
                                    {p.photos[0] /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={p.photos[0]} alt="" className="h-full w-full object-cover" /> : k.emoji}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-baloo text-lg font-medium">{p.name}</p>
                                    <p className="truncate text-xs text-[#4b5568]">{k.label}{p.province ? ` · ${p.province}` : ""} · sugerido por {who.get(p.memberId) ?? "membro removido"} em {new Date(p.submittedAt ?? p.updatedAt).toLocaleDateString("pt-PT")}</p>
                                    {p.status === "rejected" && p.reviewNote && <p className="mt-0.5 truncate text-xs text-[#b5311d]">Motivo: {p.reviewNote}</p>}
                                </div>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs ${STATUS_STYLE[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                                {p.status === "pending"
                                    ? <Link href={`/admin/locais-sugeridos/${p.id}`} className="rounded-full bg-[#0054b5] px-4 py-2 text-sm font-medium text-white hover:opacity-90">Rever</Link>
                                    : p.published
                                        ? <Link href={`/admin/c/${p.published.collection}/${p.published.slug}`} className="rounded-full border border-[#0b1220]/20 px-4 py-2 text-sm hover:bg-[#eef2f8]" title={publicUrlOf(p.published.collection, p.published.slug)}>Abrir conteúdo</Link>
                                        : <Link href={`/admin/locais-sugeridos/${p.id}`} className="rounded-full border border-[#0b1220]/20 px-4 py-2 text-sm hover:bg-[#eef2f8]">Ver</Link>}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
