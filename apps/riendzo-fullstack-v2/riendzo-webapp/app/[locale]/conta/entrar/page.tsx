import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getMember } from "@/lib/members-auth";
import AuthLayout from "@/app/components/account/auth-layout";
import { LoginForm } from "@/app/components/account/auth-forms";

export default async function SignIn({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
    const { next = "/conta", reset } = await searchParams;
    if (await getMember()) redirect("/conta");
    const safe = /^\/(?!\/)[\w\-/?=&%.#]*$/.test(next) ? next : "/conta";
    return (
        <AuthLayout title="Entrar" subtitle="Entre na sua conta Riendzo AI." footer={<>Ainda não tem conta? <Link href={`/conta/registar?next=${encodeURIComponent(safe)}`} className="font-medium text-[#0054b5] hover:underline">Criar conta</Link></>}>
            {reset === "1" && <p role="status" className="mt-4 rounded-xl bg-[#2f9e44]/12 px-3 py-2 text-sm text-[#237a35]">Palavra-passe alterada. Já pode entrar.</p>}
            <LoginForm next={safe} />
        </AuthLayout>
    );
}
