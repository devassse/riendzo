import { requireAdmin } from "@/lib/cms/auth";
import { getMenuFlags } from "@/lib/cms/menus";
import { NAV_SECTIONS } from "@/app/components/utils/riendzo-nav-data";
import MenusManager from "../../../_components/menus-manager";

export default async function MenusPage() {
    await requireAdmin(["admin"]);
    const sections = NAV_SECTIONS.map((s) => ({ id: s.id, label: s.label, emoji: s.emoji, links: s.links.map((l) => ({ title: l.title, href: l.href })) }));
    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="font-baloo text-3xl font-bold">Menus e “Em breve”</h1>
            <div className="mt-2"><MenusManager sections={sections} initial={await getMenuFlags()} /></div>
        </div>
    );
}
