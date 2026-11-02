"use client";

import { useActionState, useRef, useState } from "react";
import { updateStaffProfileAction, type FormState } from "../actions";
import Req, { RequiredNote } from "@/app/components/utils/req";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0370d6]";
const ROLE: Record<string, string> = { admin: "Administrador", editor: "Editor", owner: "Proprietário" };

/** Profile of whoever is logged in: photo (uploaded from the device), name, e-mail and phone. */
export default function ProfileEditor({ user }: { user: { username: string; name: string; role: string; avatar?: string; email?: string; phone?: string } }) {
    const [s, action, pending] = useActionState<FormState, FormData>(updateStaffProfileAction, {});
    const [avatar, setAvatar] = useState(user.avatar ?? "");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    async function upload(f: File | undefined) {
        if (!f) return;
        if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return setErr("Use JPG, PNG ou WebP.");
        if (f.size > 5 * 1024 * 1024) return setErr("A imagem deve ter menos de 5 MB.");
        setBusy(true); setErr("");
        const body = new FormData(); body.append("file", f);
        try {
            const r = await fetch("/api/admin/upload", { method: "POST", body });
            const d = await r.json();
            const url = d.files?.[0]?.url as string | undefined;
            if (r.ok && url) setAvatar(url); else setErr(d.errors?.[0] ?? d.error ?? "Falha no envio.");
        } catch { setErr("Falha de ligação."); } finally { setBusy(false); }
    }

    const initials = (user.name || user.username).split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    return (
        <form action={action} className="space-y-5 rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm">
            <input type="hidden" name="avatar" value={avatar} />
            <div className="flex items-center gap-5">
                <span className="flex h-24 w-24 flex-none items-center justify-center overflow-hidden rounded-full bg-[#0054b5] font-baloo text-3xl font-bold text-white">
                    {avatar /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={avatar} alt="A sua fotografia" className="h-full w-full object-cover" /> : initials}
                </span>
                <div>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
                    <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="cursor-pointer rounded-full border border-[#0b1220]/20 px-4 py-2 text-sm font-medium hover:bg-[#eef2f8]">{busy ? "A enviar…" : "Carregar fotografia"}</button>
                    {avatar && <button type="button" onClick={() => setAvatar("")} className="ml-2 cursor-pointer text-sm text-[#d23b25] hover:underline">Remover</button>}
                    <p className="mt-1 text-[11px] text-[#5b6478]">Do seu dispositivo. JPG, PNG ou WebP até 5 MB.</p>
                    {err && <p role="alert" className="text-xs text-[#b5311d]">{err}</p>}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-medium sm:col-span-2">Nome<Req /><input name="name" defaultValue={user.name} required className={input} /></label>
                <label className="block text-xs font-medium">E-mail<input name="email" type="email" defaultValue={user.email ?? ""} autoComplete="email" placeholder="nome@exemplo.com" className={input} /></label>
                <label className="block text-xs font-medium">Telefone<input name="phone" type="tel" defaultValue={user.phone ? `+${user.phone}` : ""} autoComplete="tel" placeholder="84 123 4567" className={input} /></label>
            </div>
            <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div><dt className="text-[10px] uppercase tracking-[0.16em] text-[#5b6478]">Utilizador</dt><dd>@{user.username}</dd></div>
                <div><dt className="text-[10px] uppercase tracking-[0.16em] text-[#5b6478]">Perfil</dt><dd>{ROLE[user.role] ?? user.role}</dd></div>
            </dl>
            <p className="text-[11px] text-[#5b6478]">O e-mail serve para recuperar a palavra-passe e receber notificações.</p>

            {s.error && <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-sm text-[#b5311d]">{s.error}</p>}
            {s.ok && <p role="status" className="rounded-xl bg-[#2f9e44]/12 px-3 py-2 text-sm text-[#237a35]">{s.ok}</p>}
            <RequiredNote />
            <button disabled={pending} className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">{pending ? "A guardar…" : "Guardar perfil"}</button>
        </form>
    );
}
