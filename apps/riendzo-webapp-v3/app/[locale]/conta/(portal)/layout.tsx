import { requireMember } from "@/app/actions/member-actions";
import MemberShell, { type MemberGroup } from "@/app/components/account/member-shell";
import { COLLECTIONS, GROUPS } from "@/lib/cms/collections";

export const dynamic = "force-dynamic";

/** Member portal: same layout as the BackOffice, but view-only. */
export default async function PortalLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const m = await requireMember("/conta");
    const groups: MemberGroup[] = GROUPS.map((g) => ({
        id: g.id, label: g.label, emoji: g.emoji,
        items: COLLECTIONS.filter((c) => c.group === g.id).map((c) => ({ id: c.id, label: c.label })),
    }));
    return <MemberShell groups={groups} name={`${m.firstName} ${m.lastName}`} avatar={m.avatar} locale={locale}>{children}</MemberShell>;
}
