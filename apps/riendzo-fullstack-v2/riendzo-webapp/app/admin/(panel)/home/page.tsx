import { COLLECTIONS, getGroup } from "@/lib/cms/collections";
import { getHomeConfig, MAX_EXPERIENCES } from "@/lib/cms/home";
import { getItems, titleOf } from "@/lib/cms/store";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import { requireAdmin } from "@/lib/cms/auth";
import HomeManager, { type FlagGroup, type PickOption } from "../../_components/home-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Home | Riendzo BackOffice" };

const FLAG_GROUPS = ["history", "services", "entertainment"] as const;

export default async function HomeAdmin() {
    const session = await requireAdmin();
    if (session.role === "owner") return null;

    const cfg = await getHomeConfig();
    const catalog = COLLECTIONS.filter((c) => c.kind === "catalog");
    const all = await Promise.all(catalog.map(async (c) => ({ c, items: (await getItems<CatalogItem>(c.id)).filter((i) => i.status !== "draft") })));

    const options: PickOption[] = all.flatMap(({ c, items }) => items.map((i) => ({ value: `${c.id}:${i.slug}`, label: titleOf(i), group: c.label, image: i.images?.[0], tag: i.tag })));

    const flags: FlagGroup[] = FLAG_GROUPS.map((g) => ({
        id: g,
        label: getGroup(g).label,
        emoji: getGroup(g).emoji,
        collections: all.filter(({ c }) => c.group === g).map(({ c, items }) => ({
            id: c.id, label: c.label,
            on: items.filter((i) => i.showOnHome).map((i) => ({ slug: i.slug, title: i.title })),
            off: items.filter((i) => !i.showOnHome).map((i) => ({ slug: i.slug, title: i.title })),
        })),
    }));

    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="font-baloo text-3xl font-bold">Home (página inicial)</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">Tudo o que aparece na Home vem daqui e do conteúdo registado. Nada é texto fixo no código.</p>
            <HomeManager initial={cfg} options={options} max={MAX_EXPERIENCES} flags={flags} />
        </div>
    );
}
