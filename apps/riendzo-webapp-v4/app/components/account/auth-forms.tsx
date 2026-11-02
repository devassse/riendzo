"use client";

import { useActionState } from "react";
import { loginMemberAction, registerAction, type FormState } from "@/app/actions/member-actions";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-[#f3f6fb] px-4 py-3 text-sm text-[#0b1220] outline-none transition-colors focus:border-[#0370d6] focus:bg-white";
const btn = "w-full cursor-pointer rounded-full bg-[#0054b5] px-5 py-3 font-baloo text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60";

export function LoginForm({ next }: { next: string }) {
    const [s, action, pending] = useActionState<FormState, FormData>(loginMemberAction, {});
    return (
        <form action={action} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={next} />
            <label className="block text-xs font-medium">E-mail ou telefone<input name="contact" autoComplete="username" required className={input} /></label>
            <label className="block text-xs font-medium">Palavra-passe<input name="password" type="password" autoComplete="current-password" required className={input} /></label>
            {s.error && <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-xs text-[#b5311d]">{s.error}</p>}
            <button type="submit" disabled={pending} className={btn}>{pending ? "A entrar…" : "Entrar"}</button>
        </form>
    );
}

export function RegisterForm({ next }: { next: string }) {
    const [s, action, pending] = useActionState<FormState, FormData>(registerAction, {});
    return (
        <form action={action} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={next} />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-medium">Nome<input name="firstName" autoComplete="given-name" required className={input} /></label>
                <label className="block text-xs font-medium">Apelido<input name="lastName" autoComplete="family-name" required className={input} /></label>
            </div>
            <label className="block text-xs font-medium">E-mail ou número de telefone<input name="contact" autoComplete="username" required placeholder="nome@exemplo.com ou 84 123 4567" className={input} /></label>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-medium">Palavra-passe<input name="password" type="password" autoComplete="new-password" minLength={8} required className={input} /></label>
                <label className="block text-xs font-medium">Verificar palavra-passe<input name="confirm" type="password" autoComplete="new-password" minLength={8} required className={input} /></label>
            </div>
            <p className="text-[11px] text-[#5b6478]">Pelo menos 8 caracteres. Ao criar conta aceita os <a href="/termos" className="underline">Termos</a> e a <a href="/privacidade" className="underline">Política de Privacidade</a>.</p>
            {s.error && <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-xs text-[#b5311d]">{s.error}</p>}
            <button type="submit" disabled={pending} className={btn}>{pending ? "A criar conta…" : "Criar conta"}</button>
        </form>
    );
}
