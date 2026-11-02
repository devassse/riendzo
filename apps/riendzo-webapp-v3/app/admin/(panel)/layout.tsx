import { requireAdmin } from "@/lib/cms/auth";
import { COLLECTIONS, GROUPS } from "@/lib/cms/collections";
import { getStats } from "@/lib/cms/store";
import { listMessages } from "@/lib/cms/inbox";
import AdminShell, { type NavGroup } from "../_components/admin-shell";

export const dynamic = "force-dynamic";

/** Staff area (administrators and editors). Owners of an establishment have their own portal. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
    const session = await requireAdmin();
    const stats = await getStats();

    // Same menus, in the same order, as the public Riendzo navbar
    const groups: NavGroup[] = GROUPS.map((g) => ({
        id: g.id, label: g.label, color: g.color,
        items: COLLECTIONS.filter((c) => c.group === g.id).map((c) => {
            const s = stats.find((x) => x.id === c.id);
            return { id: c.id, label: c.label, count: s?.total ?? 0, drafts: s?.drafts ?? 0 };
        }),
    }));
    const drafts = stats.reduce((n, s) => n + s.drafts, 0);
    const unread = session.role === "admin" ? (await listMessages()).filter((m) => !m.read).length : 0;

    return <AdminShell groups={groups} user={session.name || session.user} role={session.role} drafts={drafts} unread={unread}>{children}</AdminShell>;
}
