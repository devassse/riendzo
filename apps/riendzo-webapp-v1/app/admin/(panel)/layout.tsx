import { requireAdmin } from "@/lib/cms/auth";
import { COLLECTIONS, GROUPS } from "@/lib/cms/collections";
import { getStats } from "@/lib/cms/store";
import AdminShell, { type NavGroup } from "../_components/admin-shell";

export const dynamic = "force-dynamic";

/** Same menus, in the same order, as the public Riendzo navbar. */
const ORDER = ["historia", "musica", "gastronomy", "tourism", "services", "entertainment", "blog"];
const SOON: NavGroup[] = [
    { id: "historia", label: "História", color: "#0054b5", soon: true, items: [] },
    { id: "musica", label: "Música", color: "#0054b5", soon: true, items: [] },
];

/** Every page inside the panel requires a valid administrator session. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
    const session = await requireAdmin();
    const stats = await getStats();

    const managed: NavGroup[] = GROUPS.map((g) => ({
        id: g.id, label: g.label, color: g.color,
        items: COLLECTIONS.filter((c) => c.group === g.id).map((c) => {
            const s = stats.find((x) => x.id === c.id);
            return { id: c.id, label: c.label, count: s?.total ?? 0, drafts: s?.drafts ?? 0 };
        }),
    }));
    const groups = [...SOON, ...managed].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
    const drafts = stats.reduce((n, s) => n + s.drafts, 0);

    return <AdminShell groups={groups} user={session.user} drafts={drafts}>{children}</AdminShell>;
}
