import { requireAdmin } from "@/lib/cms/auth";
import { COLLECTIONS, GROUPS } from "@/lib/cms/collections";
import { getItems, getStats } from "@/lib/cms/store";
import type { Artist } from "@/lib/cms/artist-types";
import { listMessages } from "@/lib/cms/inbox";
import { recentNotices } from "@/lib/cms/notifications";
import AdminShell, { type NavGroup } from "../_components/admin-shell";

export const dynamic = "force-dynamic";

/** Staff area (administrators and editors). Owners of an establishment have their own portal. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
    const session = await requireAdmin();
    const stats = await getStats();
    const albums = (await getItems<Artist>("music-artists")).reduce((n, a) => n + (a.albums?.length ?? 0), 0);

    // Same menus, in the same order, as the public Riendzo navbar
    const groups: NavGroup[] = GROUPS.map((g) => ({
        id: g.id, label: g.label, color: g.color,
        items: COLLECTIONS.filter((c) => c.group === g.id).flatMap((c) => {
            const s = stats.find((x) => x.id === c.id);
            const item = { id: c.id, label: c.label, count: s?.total ?? 0, drafts: s?.drafts ?? 0 };
            // Discografias has no collection of its own: it is managed inside each artist
            return c.id === "music-artists"
                ? [item, { id: "discografias", label: "Discografias", count: albums, drafts: 0, href: "/admin/discografias" }]
                : [item];
        }),
    }));
    const drafts = stats.reduce((n, s) => n + s.drafts, 0);
    const unread = session.role === "admin" ? (await listMessages()).filter((m) => !m.read).length : 0;

    const notices = await recentNotices("staff", 10);

    return <AdminShell groups={groups} user={session.name || session.user} role={session.role} avatar={session.avatar} drafts={drafts} unread={unread} notices={notices}>{children}</AdminShell>;
}
