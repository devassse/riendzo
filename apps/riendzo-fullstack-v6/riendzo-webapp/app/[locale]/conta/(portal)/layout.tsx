import { requireMember } from "@/app/actions/member-actions";
import MemberShell, { type MemberGroup } from "@/app/components/account/member-shell";
import { COLLECTIONS, GROUPS } from "@/lib/cms/collections";
import { recentNotices } from "@/lib/cms/notifications";

export const dynamic = "force-dynamic";

/** Member portal: same layout as the BackOffice, but view-only. */
export default async function PortalLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const m = await requireMember("/conta");
    const groups: MemberGroup[] = GROUPS.map((g) => ({
        id: g.id, label: g.label, emoji: g.emoji,
        // Discografias has no collection of its own: it is built from the artists' albums
        items: COLLECTIONS.filter((c) => c.group === g.id).flatMap((c) => [
            { id: c.id, label: c.label },
            ...(c.id === "music-artists" ? [{ id: "discografias", label: "Discografias" }] : []),
        ]),
    }));
    const notices = await recentNotices("member", 10);
    return <MemberShell groups={groups} name={`${m.firstName} ${m.lastName}`} avatar={m.avatar} locale={locale} notices={notices}>{children}</MemberShell>;
}
