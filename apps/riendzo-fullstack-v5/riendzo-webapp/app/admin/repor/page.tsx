import Link from "next/link";
import { peekReset } from "@/lib/password-reset";
import { resetStaffPasswordAction } from "@/app/actions/password-reset-actions";
import { NewPasswordForm } from "@/app/components/account/reset-forms";

export const metadata = { title: "Nova palavra-passe | Riendzo BackOffice" };
export const dynamic = "force-dynamic";

export default async function StaffReset({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
    const { token = "" } = await searchParams;
    const valid = token.length > 0 && (await peekReset("staff", token)) !== null;
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f3f6fb] px-6 py-12">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/riendzo-logo.png" alt="Riendzo" className="mb-6 w-44" />
                <h1 className="font-baloo text-3xl font-bold text-[#0b1220]">Nova palavra-passe</h1>
                {valid ? (
                    <>
                        <p className="mt-1 text-sm text-[#4b5568]">Mínimo 8 caracteres, com letras e números.</p>
                        <NewPasswordForm action={resetStaffPasswordAction} token={token} />
                    </>
                ) : (
                    <p className="mt-6 rounded-xl bg-[#e5533d]/10 p-4 text-sm text-[#b5311d]">O link expirou ou já foi usado. <Link href="/admin/recuperar" className="font-medium underline">Peça um novo link</Link>.</p>
                )}
            </div>
        </main>
    );
}
