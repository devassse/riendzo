"use client";

import { useActionState } from "react";
import { sendContactAction, type ContactState } from "@/app/actions/member-actions";
import Req, { RequiredNote } from "@/app/components/utils/req";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-[#f3f6fb] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0370d6] focus:bg-white";

export default function ContactForm() {
    const [s, action, pending] = useActionState<ContactState, FormData>(sendContactAction, {});
    const v = s.values; // after an error the fields keep what was typed; after a successful send they come back empty, ready for another message
    return (
        <form action={action} className="space-y-4">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <label className="block text-xs font-medium">Nome<Req /><input name="name" required maxLength={80} autoComplete="name" defaultValue={v?.name} className={input} /></label>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-medium">E-mail<input type="email" name="email" maxLength={120} autoComplete="email" defaultValue={v?.email} placeholder="nome@exemplo.com" className={input} /></label>
                <label className="block text-xs font-medium">Telefone<input type="tel" name="phone" maxLength={30} inputMode="tel" autoComplete="tel" defaultValue={v?.phone} placeholder="+258 84 123 4567" className={input} /></label>
            </div>
            <p className="-mt-2 text-[11px] text-[#5b6478]"><span aria-hidden="true" className="font-bold text-[#d23b25]">*</span> Indique pelo menos um: e-mail ou telefone.</p>
            <label className="block text-xs font-medium">Mensagem<Req /><textarea name="message" required rows={6} maxLength={2000} defaultValue={v?.message} className={input} /></label>
            {s.error && !pending && <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-sm text-[#b5311d]">{s.error}</p>}
            {s.ok && !pending && <p role="status" className="rounded-2xl bg-[#2f9e44]/12 px-4 py-3 text-sm text-[#237a35]">{s.ok} Responderemos o mais breve possível. Se quiser, pode enviar outra mensagem.</p>}
            <RequiredNote />
            <button type="submit" disabled={pending} className="cursor-pointer rounded-full bg-[#0054b5] px-7 py-3 font-baloo font-medium text-white hover:opacity-90 disabled:opacity-60">{pending ? "A enviar…" : "Enviar mensagem"}</button>
        </form>
    );
}