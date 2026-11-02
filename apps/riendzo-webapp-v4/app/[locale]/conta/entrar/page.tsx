import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getMember } from "@/lib/members-auth";
import AuthLayout from "@/app/components/account/auth-layout";
import { LoginForm } from "@/app/components/account/auth-forms";

export default async function SignIn({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const { next = "/conta" } = await searchParams;
    if (await getMember()) redirect("/conta");
    const safe = /^\/(?!\/)[\w\-/?=&%.#]*$/.test(next) ? next : "/conta";
    return (
        <AuthLayout title="Entrar" subtitle="Entre na sua conta Riendzo AI." footer={<>Ainda não tem conta? <Link href={`/conta/registar?next=${encodeURIComponent(safe)}`} className="font-medium text-[#0054b5] hover:underline">Criar conta</Link></>}>
            <LoginForm next={safe} />
        </AuthLayout>
    );
}
