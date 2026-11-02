import { requireMember } from "@/app/actions/member-actions";
import ProfileForm from "@/app/components/account/profile-form";
import { getList } from "@/lib/cms/lists";
import { LANGUAGES } from "@/lib/data/mozambique";

export default async function Profile({ searchParams }: { searchParams: Promise<{ novo?: string }> }) {
    const m = await requireMember("/conta/perfil");
    const { novo } = await searchParams;
    const [provinces, genres, cuisines, specialties, areas, lodging] = await Promise.all(
        ["provinces", "music-genres", "cuisines", "guide-specialties", "creator-areas", "lodging-types"].map(getList)
    );
    const interests = [...new Set([...genres, ...cuisines, ...specialties, ...areas, ...lodging].map((i) => i.label))];
    const languages = ["Português", "Inglês", "Francês", ...LANGUAGES.filter((l) => l.id !== "portugues").map((l) => l.name)];

    return (
        <div className="mx-auto max-w-6xl">
            {novo && <p role="status" className="mb-4 rounded-2xl bg-[#2f9e44]/12 px-4 py-3 text-sm text-[#237a35]">Conta criada! Complete o perfil para receber sugestões à sua medida.</p>}
            <h1 className="font-baloo text-3xl font-bold">O meu perfil</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">Quanto mais nos contar, melhores serão as sugestões.</p>
            <ProfileForm member={m} provinces={provinces.map((p) => p.label)} languages={languages} interests={interests} styles={["Aventura", "Cultura e história", "Relax e praia", "Gastronomia", "Natureza e safári", "Em família", "Negócios"]} />
        </div>
    );
}
