import { redirect } from "next/navigation";
import { getSessionMember } from "@/lib/members-auth";
import { isVerified } from "@/lib/members";
import { codeStatus, CODE_MINUTES, COOLDOWN_SECONDS, maskEmail, maskPhone } from "@/lib/verification";
import AuthLayout from "@/app/components/account/auth-layout";
import { VerifyForm } from "@/app/components/account/verify-form";

export const dynamic = "force-dynamic";

/** Confirm the account with the code sent by e-mail or SMS. Unconfirmed members always end up here. */
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ next?: string; novo?: string }> }) {
    const { next = "/conta", novo } = await searchParams;
    const safe = /^\/(?!\/)[\w\-/?=&%.#]*$/.test(next) ? next : "/conta";
    const m = await getSessionMember();
    if (!m) redirect(`/conta/entrar?next=${encodeURIComponent(safe)}`);
    if (isVerified(m)) redirect(safe);

    const status = await codeStatus(m.id);
    return (
        <AuthLayout title="Confirme a sua conta" subtitle="Enviámos-lhe um código de verificação." footer={null}>
            <VerifyForm
                next={safe} isNew={novo === "1"} firstName={m.firstName}
                email={m.email ? maskEmail(m.email) : undefined} phone={m.phone ? maskPhone(m.phone) : undefined}
                status={status} minutes={CODE_MINUTES} cooldown={COOLDOWN_SECONDS}
            />
        </AuthLayout>
    );
}
