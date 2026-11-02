import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getMember } from "@/lib/members-auth";
import AuthLayout from "@/app/components/account/auth-layout";
import { RegisterForm } from "@/app/components/account/auth-forms";

export default async function SignUp({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const { next = "/conta" } = await searchParams;
    if (await getMember()) redirect("/conta");
    const safe = /^\/(?!\/)[\w\-/?=&%.#]*$/.test(next) ? next : "/conta";
    return (
        <AuthLayout title="Criar conta" subtitle="É grátis e demora um minuto." footer={<>Já tem conta? <Link href={`/conta/entrar?next=${encodeURIComponent(safe)}`} className="font-medium text-[#0054b5] hover:underline">Entrar</Link></>}>
            <RegisterForm next={safe} />
        </AuthLayout>
    );
}
