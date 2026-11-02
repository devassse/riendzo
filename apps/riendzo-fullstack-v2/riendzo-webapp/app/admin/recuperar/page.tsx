import Link from "next/link";
import { requestStaffResetAction } from "@/app/actions/password-reset-actions";
import { ContactAdminForm, RequestResetForm } from "@/app/components/account/reset-forms";

export const metadata = { title: "Recuperar palavra-passe | Riendzo BackOffice" };

export default function StaffForgot() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f3f6fb] px-6 py-12">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/riendzo-logo.png" alt="Riendzo" className="mb-6 w-44" />
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#0054b5]">BackOffice</p>
                <h1 className="mt-1 font-baloo text-3xl font-bold text-[#0b1220]">Recuperar palavra-passe</h1>

                <h2 className="mt-6 font-baloo text-lg font-medium">1. Receber um e-mail para repor</h2>
                <p className="text-sm text-[#4b5568]">Funciona para utilizadores com e-mail registado (Administrador &gt; Utilizadores).</p>
                <RequestResetForm action={requestStaffResetAction} />

                <div className="my-7 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#8a93a6]"><span className="h-px flex-1 bg-[#0b1220]/10" />ou<span className="h-px flex-1 bg-[#0b1220]/10" /></div>

                <h2 className="font-baloo text-lg font-medium">2. Contactar o administrador</h2>
                <p className="text-sm text-[#4b5568]">A conta principal (definida no servidor) só pode ser reposta por quem gere o servidor: ADMIN_PASSWORD.</p>
                <ContactAdminForm subject="Esqueci-me da palavra-passe (BackOffice)" />

                <p className="mt-6 text-center text-sm"><Link href="/admin/login" className="font-medium text-[#0054b5] hover:underline">← Voltar ao início de sessão</Link></p>
            </div>
        </main>
    );
}
