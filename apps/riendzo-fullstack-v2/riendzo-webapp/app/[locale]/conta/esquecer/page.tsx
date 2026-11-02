import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getMember } from "@/lib/members-auth";
import { requestMemberResetAction } from "@/app/actions/password-reset-actions";
import AuthLayout from "@/app/components/account/auth-layout";
import { ContactAdminForm, RequestResetForm } from "@/app/components/account/reset-forms";

export default async function Forgot({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    if (await getMember()) redirect("/conta");
    return (
        <AuthLayout title="Recuperar palavra-passe" subtitle="Escolha como quer voltar a entrar na sua conta." footer={<Link href="/conta/entrar" className="font-medium text-[#0054b5] hover:underline">← Voltar a entrar</Link>}>
            <section aria-labelledby="by-mail" className="mt-6">
                <h3 id="by-mail" className="font-baloo text-lg font-medium">1. Receber um e-mail para repor</h3>
                <p className="text-sm text-[#4b5568]">Enviamos um link seguro, válido durante 1 hora, para criar uma nova palavra-passe.</p>
                <RequestResetForm action={requestMemberResetAction} locale={locale} />
            </section>
            <div className="my-7 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#8a93a6]"><span className="h-px flex-1 bg-[#0b1220]/10" />ou<span className="h-px flex-1 bg-[#0b1220]/10" /></div>
            <section aria-labelledby="by-admin">
                <h3 id="by-admin" className="font-baloo text-lg font-medium">2. Contactar o administrador</h3>
                <p className="text-sm text-[#4b5568]">Ideal se a sua conta foi criada com telefone ou já não tem acesso ao e-mail.</p>
                <ContactAdminForm subject="Esqueci-me da palavra-passe (Portal do utilizador)" />
            </section>
        </AuthLayout>
    );
}
