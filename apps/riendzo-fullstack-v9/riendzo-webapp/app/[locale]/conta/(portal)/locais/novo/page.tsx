import { Link } from "@/i18n/navigation";
import { requireMember } from "@/app/actions/member-actions";
import PlaceForm from "@/app/components/account/place-form";
import { getList } from "@/lib/cms/lists";

export const dynamic = "force-dynamic";

export default async function NewPlace() {
    await requireMember("/conta/locais/novo");
    const provinces = (await getList("provinces")).map((p) => p.label).filter((p) => p !== "Nacional" && p !== "Várias províncias");
    return (
        <div className="mx-auto max-w-6xl">
            <p className="text-sm"><Link href="/conta/locais" className="text-[#0054b5] hover:underline">← Os meus locais</Link></p>
            <h1 className="mt-2 font-baloo text-3xl font-bold">Novo local</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">Comece pelo nome e pelo tipo. O resto pode completar depois.</p>
            <PlaceForm provinces={provinces} />
        </div>
    );
}
