"use client";

import { useActionState } from "react";
import Link from "next/link";
import PasswordInput from "@/app/components/utils/password-input";
import { loginAction, type LoginState } from "../actions";
import Req, { RequiredNote } from "@/app/components/utils/req";

export default function LoginForm() {
    const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

    const input =
        "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-[#f3f6fb] px-4 py-3 text-sm text-[#0b1220] outline-none transition-colors focus:border-[#0370d6] focus:bg-white";

    return (
        <form action={action} className="mt-6 space-y-4">
            <label className="block text-xs font-medium text-[#0b1220]">
                Utilizador<Req /><input name="username" autoComplete="username" required className={input} />
            </label>
            <label className="block text-xs font-medium text-[#0b1220]">
                Palavra-passe<Req /><PasswordInput name="password" autoComplete="current-password" required className={input} />
            </label>

            <div className="text-right">
                <Link href="/admin/recuperar" className="text-xs font-medium text-[#0054b5] hover:underline">Esqueceu a palavra-passe?</Link>
            </div>

            {state.error && (
                <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-xs text-[#b5311d]">{state.error}</p>
            )}

            <RequiredNote />

            <button type="submit" disabled={pending} className="w-full cursor-pointer rounded-full bg-[#0054b5] px-5 py-3 font-baloo text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60">
                {pending ? "A entrar…" : "Entrar"}
            </button>

            <a href="/pt" className="flex items-center justify-center gap-1 rounded-full border border-[#0b1220]/15 px-5 py-3 text-sm font-medium text-[#0b1220] hover:bg-[#0b1220]/5">
                ← Ir ao site
            </a>
        </form>
    );
}
