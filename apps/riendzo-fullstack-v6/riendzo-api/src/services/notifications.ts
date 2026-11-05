/** Notifications = recently created records (new restaurant, beach, place…), built from the activity log. */
import { prisma } from "../db";

export type Notice = {
    id: string; at: string; by?: string; collection: string; slug: string; title: string; label: string; emoji: string;
    /** path without language prefix */
    href: string;
};

export async function recentNotices(audience: "staff" | "member", limit = 8): Promise<Notice[]> {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [rows, cols] = await Promise.all([
        prisma.activity.findMany({ where: { action: "Criou", at: { gte: since }, slug: { not: null }, collection: { not: null } }, orderBy: { id: "desc" }, take: 120 }),
        prisma.collection.findMany({ include: { group: true } }),
    ]);
    const byId = new Map(cols.map((c) => [c.id, c]));
    const seen = new Set<string>();
    const out: Notice[] = [];

    for (const a of rows) {
        if (out.length >= limit) break;
        const key = `${a.collection}:${a.slug}`;
        const col = byId.get(a.collection!);
        if (!col || seen.has(key)) continue;
        seen.add(key);
        const item = await prisma.item.findUnique({ where: { collectionId_slug: { collectionId: col.id, slug: a.slug! } }, select: { title: true, status: true } });
        if (!item || (audience === "member" && item.status === "draft")) continue;
        out.push({
            id: `${a.at.toISOString()}-${key}`, at: a.at.toISOString(), by: audience === "staff" ? a.userName : undefined,
            collection: col.id, slug: a.slug!, title: item.title || a.title || a.slug!, label: `Novo ${col.singular}`, emoji: col.group.emoji,
            href: audience === "staff" ? `/admin/c/${col.id}/${a.slug}` : col.directory ? `${col.publicPath}/${a.slug}` : `${col.publicPath}?item=${a.slug}`,
        });
    }
    return out;
}
