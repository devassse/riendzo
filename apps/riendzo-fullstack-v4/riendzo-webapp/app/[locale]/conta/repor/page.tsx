import { Link } from "@/i18n/navigation";
import { peekReset } from "@/lib/password-reset";
import { resetMemberPasswordAction } from "@/app/actions/password-reset-actions";
import AuthLayout from "@/app/components/account/auth-layout";
import { NewPasswordForm } from "@/app/components/account/reset-forms";

export default async function ResetPassword({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
    const { token = "" } = await searchParams;
    const valid = token.length > 0 && (await peekReset("member", token)) !== null;
    return (
        <AuthLayout title="Nova palavra-passe" subtitle={valid ? "Escolha uma palavra-passe nova (mínimo 8 caracteres)." : "Este link já não é válido."} footer={<Link href="/conta/entrar" className="font-medium text-[#0054b5] hover:underline">← Voltar a entrar</Link>}>
            {valid ? (
                <NewPasswordForm action={resetMemberPasswordAction} token={token} />
            ) : (
                <p className="mt-6 rounded-xl bg-[#e5533d]/10 p-4 text-sm text-[#b5311d]">O link expirou ou já foi usado. <Link href="/conta/esquecer" className="font-medium underline">Peça um novo link</Link>.</p>
            )}
        </AuthLayout>
    );
}
