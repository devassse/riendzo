"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

export default function LoginForm() {
    const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

    const input =
        "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-[#f3f6fb] px-4 py-3 text-sm text-[#0b1220] outline-none transition-colors focus:border-[#0370d6] focus:bg-white";

    return (
        <form action={action} className="mt-6 space-y-4">
            <label className="block text-xs font-medium text-[#0b1220]">
                Utilizador
                <input name="username" autoComplete="username" required className={input} />
            </label>
            <label className="block text-xs font-medium text-[#0b1220]">
                Palavra-passe
                <input name="password" type="password" autoComplete="current-password" required className={input} />
            </label>

            {state.error && (
                <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-xs text-[#b5311d]">{state.error}</p>
            )}

            <button type="submit" disabled={pending} className="w-full cursor-pointer rounded-full bg-[#0054b5] px-5 py-3 font-baloo text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60">
                {pending ? "A entrar…" : "Entrar"}
            </button>
        </form>
    );
}
