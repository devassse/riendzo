"use client";

import { useActionState } from "react";
import { changeOwnPasswordAction, type FormState } from "../actions";
import Req, { RequiredNote } from "@/app/components/utils/req";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0370d6]";

export default function PasswordForm() {
    const [s, action, pending] = useActionState<FormState, FormData>(changeOwnPasswordAction, {});
    return (
        <form action={action} className="space-y-3 rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm">
            <label className="block text-xs font-medium">Palavra-passe atual<Req /><input name="current" type="password" autoComplete="current-password" required className={input} /></label>
            <label className="block text-xs font-medium">Nova palavra-passe<Req /><input name="next" type="password" autoComplete="new-password" minLength={8} required className={input} /></label>
            <label className="block text-xs font-medium">Verificar nova palavra-passe<Req /><input name="confirm" type="password" autoComplete="new-password" minLength={8} required className={input} /></label>
            {s.error && <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-sm text-[#b5311d]">{s.error}</p>}
            {s.ok && <p role="status" className="rounded-xl bg-[#2f9e44]/12 px-3 py-2 text-sm text-[#237a35]">{s.ok}</p>}
            <RequiredNote />
            <button disabled={pending} className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">Alterar palavra-passe</button>
        </form>
    );
}
