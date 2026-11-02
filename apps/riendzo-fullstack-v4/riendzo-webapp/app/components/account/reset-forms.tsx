"use client";

import { useActionState, useState } from "react";
import PasswordInput from "@/app/components/utils/password-input";
import { sendMessageAction, type FormState } from "@/app/actions/member-actions";
import type { ResetState } from "@/app/actions/password-reset-actions";
import Req, { RequiredNote } from "@/app/components/utils/req";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-[#f3f6fb] px-4 py-3 text-sm text-[#0b1220] outline-none transition-colors focus:border-[#0370d6] focus:bg-white";
const btn = "w-full cursor-pointer rounded-full bg-[#0054b5] px-5 py-3 font-baloo text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60";
const Msg = ({ s }: { s: ResetState }) =>
    s.error ? <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-xs text-[#b5311d]">{s.error}</p>
        : s.ok ? <p role="status" className="rounded-xl bg-[#2f9e44]/12 px-3 py-2 text-xs text-[#237a35]">{s.ok}</p> : null;

/** Option 1: receive an e-mail with a link to create a new password. */
export function RequestResetForm({ action, locale }: { action: (s: ResetState, fd: FormData) => Promise<ResetState>; locale?: string }) {
    const [s, run, pending] = useActionState<ResetState, FormData>(action, {});
    return (
        <form action={run} className="mt-6 space-y-4">
            <input type="hidden" name="locale" value={locale ?? ""} />
            <label className="block text-xs font-medium">E-mail ou telefone da conta<Req /><input name="identifier" autoComplete="username" required placeholder="nome@exemplo.com ou 84 123 4567" className={input} /></label>
            <Msg s={s} />
            <RequiredNote />
            <button type="submit" disabled={pending} className={btn}>{pending ? "A enviar…" : "Enviar link"}</button>
        </form>
    );
}

/** Set the new password (page opened from the e-mail link). */
export function NewPasswordForm({ action, token }: { action: (s: ResetState, fd: FormData) => Promise<ResetState>; token: string }) {
    const [s, run, pending] = useActionState<ResetState, FormData>(action, {});
    const [pw, setPw] = useState("");
    const [cf, setCf] = useState("");
    const mismatch = cf.length > 0 && pw !== cf;
    return (
        <form action={run} className="mt-6 space-y-4">
            <input type="hidden" name="token" value={token} />
            <label className="block text-xs font-medium">Nova palavra-passe<Req /><PasswordInput name="next" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" minLength={8} required invalid={mismatch} className={input} /></label>
            <label className="block text-xs font-medium">Verificar palavra-passe<Req /><PasswordInput name="confirm" value={cf} onChange={(e) => setCf(e.target.value)} autoComplete="new-password" minLength={8} required invalid={mismatch} className={input} /></label>
            {mismatch && <p role="alert" className="-mt-2 text-xs font-medium text-[#d23b25]">As palavras-passe não são iguais.</p>}
            <Msg s={s} />
            <RequiredNote />
            <button type="submit" disabled={pending} className={btn}>{pending ? "A guardar…" : "Guardar nova palavra-passe"}</button>
        </form>
    );
}

/** Option 2: write to the administrator (arrives in Administrador > Mensagens). */
export function ContactAdminForm({ subject }: { subject: string }) {
    const [s, run, pending] = useActionState<FormState, FormData>(sendMessageAction, {});
    return (
        <form action={run} className="mt-4 space-y-3">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <input type="hidden" name="message" value={`${subject}. Peço ajuda para voltar a aceder à minha conta.`} />
            <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium">O seu nome<Req /><input name="name" required className={input} /></label>
                <label className="block text-xs font-medium">E-mail ou telefone<Req /><input name="contact" required className={input} /></label>
            </div>
            {s.error && <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-xs text-[#b5311d]">{s.error}</p>}
            {s.ok && <p role="status" className="rounded-xl bg-[#2f9e44]/12 px-3 py-2 text-xs text-[#237a35]">{s.ok} O administrador vai contactá-lo.</p>}
            <RequiredNote />
            <button type="submit" disabled={pending} className="w-full cursor-pointer rounded-full border border-[#0054b5] px-5 py-3 font-baloo text-sm font-medium text-[#0054b5] transition-colors hover:bg-[#0054b5]/5 disabled:opacity-60">{pending ? "A enviar…" : "Contactar o administrador"}</button>
        </form>
    );
}
