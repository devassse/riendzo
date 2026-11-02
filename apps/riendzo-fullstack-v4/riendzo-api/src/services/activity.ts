import { prisma } from "../db";
import type { StaffPrincipal } from "../lib/auth";

const KEEP = 150;

/** Never throws: a failure to log must not break the action itself. */
export async function logActivity(who: Pick<StaffPrincipal, "username">, action: string, collection?: string, title?: string, slug?: string) {
    try {
        await prisma.activity.create({ data: { userName: who.username, action, collection, slug, title: title?.slice(0, 160) } });
        const cutoff = await prisma.activity.findMany({ orderBy: { id: "desc" }, skip: KEEP, take: 1, select: { id: true } });
        if (cutoff[0]) await prisma.activity.deleteMany({ where: { id: { lte: cutoff[0].id } } });
    } catch (e) {
        console.error("activity log failed", e);
    }
}
