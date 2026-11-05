"use client";

import { useActionState, useState } from "react";
import { Link } from "@/i18n/navigation";
import PasswordInput from "@/app/components/utils/password-input";
import { loginMemberAction, registerAction, type FormState } from "@/app/actions/member-actions";
import Req, { RequiredNote } from "@/app/components/utils/req";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-[#f3f6fb] px-4 py-3 text-sm text-[#0b1220] outline-none transition-colors focus:border-[#0370d6] focus:bg-white";
const btn = "w-full cursor-pointer rounded-full bg-[#0054b5] px-5 py-3 font-baloo text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60";

export function LoginForm({ next }: { next: string }) {
    const [s, action, pending] = useActionState<FormState, FormData>(loginMemberAction, {});
    return (
        <form action={action} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={next} />
            <label className="block text-xs font-medium">E-mail ou telefone<Req /><input name="contact" autoComplete="username" required className={input} /></label>
            <label className="block text-xs font-medium">Palavra-passe<Req /><PasswordInput name="password" autoComplete="current-password" required className={input} /></label>
            <div className="text-right"><Link href="/conta/esquecer" className="text-xs font-medium text-[#0054b5] hover:underline">Esqueceu a palavra-passe?</Link></div>
            {s.error && <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-xs text-[#b5311d]">{s.error}</p>}
            <RequiredNote />
            <button type="submit" disabled={pending} className={btn}>{pending ? "A entrar…" : "Entrar"}</button>
        </form>
    );
}

export function RegisterForm({ next }: { next: string }) {
    const [s, action, pending] = useActionState<FormState, FormData>(registerAction, {});
    const [pw, setPw] = useState("");
    const [cf, setCf] = useState("");
    // red border as soon as the two passwords differ (or when the server says so)
    const mismatch = (cf.length > 0 && pw !== cf) || Boolean(s.error?.includes("não coincidem"));
    // letters AND numbers, 8+ characters
    const weak = pw.length > 0 && (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw));
    const dupEmail = Boolean(s.error?.includes("e-mail"));
    const dupPhone = Boolean(s.error?.includes("telefone"));
    return (
        <form action={action} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={next} />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-medium">Nome<Req /><input name="firstName" autoComplete="given-name" required className={input} /></label>
                <label className="block text-xs font-medium">Apelido<Req /><input name="lastName" autoComplete="family-name" required className={input} /></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-medium">E-mail<Req /><input name="email" type="email" autoComplete="email" required placeholder="nome@exemplo.com" className={`${input} ${dupEmail ? "!border-[#d23b25] !bg-[#fff5f3]" : ""}`} aria-invalid={dupEmail || undefined} /></label>
                <label className="block text-xs font-medium">Telefone<Req /><input name="phone" type="tel" autoComplete="tel" inputMode="tel" required placeholder="84 123 4567" className={`${input} ${dupPhone ? "!border-[#d23b25] !bg-[#fff5f3]" : ""}`} aria-invalid={dupPhone || undefined} /></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-medium">Palavra-passe<Req /><PasswordInput name="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" minLength={8} pattern="(?=.*[A-Za-z])(?=.*\d).{8,}" title="Pelo menos 8 caracteres, com letras e números" required invalid={mismatch || weak} className={input} /></label>
                <label className="block text-xs font-medium">Verificar palavra-passe<Req /><PasswordInput name="confirm" value={cf} onChange={(e) => setCf(e.target.value)} autoComplete="new-password" minLength={8} required invalid={mismatch} className={input} /></label>
            </div>
            {mismatch && <p role="alert" className="-mt-2 text-xs font-medium text-[#d23b25]">As palavras-passe não são iguais.</p>}
            <p className={`text-[11px] ${weak ? "font-medium text-[#d23b25]" : "text-[#5b6478]"}`}>A palavra-passe deve ter pelo menos 8 caracteres, com letras e números. Ao criar conta aceita os <a href="/termos" className="underline">Termos</a> e a <a href="/privacidade" className="underline">Política de Privacidade</a>.</p>
            {s.error && <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-xs text-[#b5311d]">{s.error}</p>}
            <RequiredNote />
            <button type="submit" disabled={pending} className={btn}>{pending ? "A criar conta…" : "Criar conta"}</button>
        </form>
    );
}
