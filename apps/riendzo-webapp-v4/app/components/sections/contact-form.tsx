"use client";

import { useActionState } from "react";
import { sendMessageAction, type FormState } from "@/app/actions/member-actions";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-[#f3f6fb] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0370d6] focus:bg-white";

export default function ContactForm() {
    const [s, action, pending] = useActionState<FormState, FormData>(sendMessageAction, {});
    if (s.ok) return <p role="status" className="rounded-2xl bg-[#2f9e44]/12 p-6 text-center text-[#237a35]">{s.ok} Responderemos o mais breve possível.</p>;
    return (
        <form action={action} className="space-y-4">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <label className="block text-xs font-medium">Nome<input name="name" required maxLength={80} autoComplete="name" className={input} /></label>
            <label className="block text-xs font-medium">E-mail ou telefone<input name="contact" required maxLength={120} className={input} /></label>
            <label className="block text-xs font-medium">Mensagem<textarea name="message" required rows={6} maxLength={2000} className={input} /></label>
            {s.error && <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-sm text-[#b5311d]">{s.error}</p>}
            <button type="submit" disabled={pending} className="cursor-pointer rounded-full bg-[#0054b5] px-7 py-3 font-baloo font-medium text-white hover:opacity-90 disabled:opacity-60">{pending ? "A enviar…" : "Enviar mensagem"}</button>
        </form>
    );
}
