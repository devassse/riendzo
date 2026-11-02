"use client";

import { useActionState, useRef, useState } from "react";
import { changePasswordAction, updateProfileAction, type FormState } from "@/app/actions/member-actions";
import type { PublicMember } from "@/lib/members";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0370d6]";
const card = "rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm";
const Msg = ({ s }: { s: FormState }) => s.error ? <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-sm text-[#b5311d]">{s.error}</p> : s.ok ? <p role="status" className="rounded-xl bg-[#2f9e44]/12 px-3 py-2 text-sm text-[#237a35]">{s.ok}</p> : null;

export default function ProfileForm({ member, provinces, languages, interests, styles }: { member: PublicMember; provinces: string[]; languages: string[]; interests: string[]; styles: string[] }) {
    const [state, action, pending] = useActionState<FormState, FormData>(updateProfileAction, {});
    const [pwState, pwAction, pwPending] = useActionState<FormState, FormData>(changePasswordAction, {});
    const [avatar, setAvatar] = useState(member.avatar ?? "");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    async function upload(f: File | undefined) {
        if (!f) return;
        setBusy(true); setErr("");
        const body = new FormData(); body.append("file", f);
        try {
            const r = await fetch("/api/conta/avatar", { method: "POST", body });
            const d = await r.json();
            if (r.ok) setAvatar(d.url); else setErr(d.error ?? "Falha no envio.");
        } catch { setErr("Falha de ligação."); } finally { setBusy(false); }
    }

    const initials = `${member.firstName[0] ?? ""}${member.lastName[0] ?? ""}`.toUpperCase();
    const Check = ({ name, values, selected }: { name: string; values: string[]; selected: string[] }) => (
        <div className="mt-2 flex flex-wrap gap-2">
            {values.map((v) => (
                <label key={v} className="cursor-pointer">
                    <input type="checkbox" name={name} value={v} defaultChecked={selected.includes(v)} className="peer sr-only" />
                    <span className="inline-block rounded-full border border-[#0b1220]/15 px-3 py-1 text-xs transition-colors peer-checked:border-[#0054b5] peer-checked:bg-[#0054b5] peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2">{v}</span>
                </label>
            ))}
        </div>
    );

    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <form action={action} className={`${card} space-y-5`}>
                <input type="hidden" name="avatar" value={avatar} />
                <div className="flex items-center gap-5">
                    <span className="flex h-24 w-24 flex-none items-center justify-center overflow-hidden rounded-full bg-[#0054b5] font-baloo text-3xl font-bold text-white">
                        {avatar /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={avatar} alt="A sua fotografia" className="h-full w-full object-cover" /> : initials}
                    </span>
                    <div>
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload(e.target.files?.[0])} />
                        <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="cursor-pointer rounded-full border border-[#0b1220]/20 px-4 py-2 text-sm font-medium hover:bg-[#eef2f8]">{busy ? "A enviar…" : "Alterar fotografia"}</button>
                        {avatar && <button type="button" onClick={() => setAvatar("")} className="ml-2 cursor-pointer text-sm text-[#d23b25] hover:underline">Remover</button>}
                        <p className="mt-1 text-[11px] text-[#5b6478]">JPG, PNG ou WebP até 2 MB.</p>
                        {err && <p className="text-xs text-[#b5311d]">{err}</p>}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-medium">Nome<input name="firstName" defaultValue={member.firstName} required className={input} /></label>
                    <label className="block text-xs font-medium">Apelido<input name="lastName" defaultValue={member.lastName} required className={input} /></label>
                    <label className="block text-xs font-medium">Província onde vive
                        <select name="province" defaultValue={member.province ?? ""} className={input}><option value="">—</option>{provinces.map((p) => <option key={p}>{p}</option>)}</select>
                    </label>
                    <label className="block text-xs font-medium">Ano de nascimento<input name="birthYear" type="number" min={1900} max={new Date().getFullYear()} defaultValue={member.birthYear ?? ""} className={input} /></label>
                    <label className="block text-xs font-medium sm:col-span-2">Estilo de viagem
                        <select name="travelStyle" defaultValue={member.travelStyle ?? ""} className={input}><option value="">—</option>{styles.map((p) => <option key={p}>{p}</option>)}</select>
                    </label>
                </div>
                <label className="block text-xs font-medium">Sobre mim<textarea name="bio" rows={3} maxLength={500} defaultValue={member.bio ?? ""} placeholder="Conte-nos um pouco sobre si e o que gosta de descobrir." className={input} /></label>
                <fieldset><legend className="text-xs font-medium">Línguas que fala</legend><Check name="languages" values={languages} selected={member.languages} /></fieldset>
                <fieldset><legend className="text-xs font-medium">Os meus interesses <span className="font-normal text-[#5b6478]">(usamo-los para sugerir conteúdos)</span></legend><Check name="interests" values={interests} selected={member.interests} /></fieldset>
                <Msg s={state} />
                <button type="submit" disabled={pending} className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">{pending ? "A guardar…" : "Guardar perfil"}</button>
            </form>

            <div className="space-y-6">
                <section className={card}>
                    <h2 className="font-baloo text-lg font-medium">Os meus dados de acesso</h2>
                    <dl className="mt-3 space-y-2 text-sm"><div><dt className="text-[10px] uppercase tracking-[0.16em] text-[#5b6478]">E-mail</dt><dd>{member.email ?? "—"}</dd></div><div><dt className="text-[10px] uppercase tracking-[0.16em] text-[#5b6478]">Telefone</dt><dd>{member.phone ? `+${member.phone}` : "—"}</dd></div></dl>
                </section>
                <form action={pwAction} className={`${card} space-y-3`}>
                    <h2 className="font-baloo text-lg font-medium">Alterar palavra-passe</h2>
                    <label className="block text-xs font-medium">Atual<input name="current" type="password" autoComplete="current-password" required className={input} /></label>
                    <label className="block text-xs font-medium">Nova<input name="next" type="password" autoComplete="new-password" minLength={8} required className={input} /></label>
                    <label className="block text-xs font-medium">Verificar nova<input name="confirm" type="password" autoComplete="new-password" minLength={8} required className={input} /></label>
                    <Msg s={pwState} />
                    <button type="submit" disabled={pwPending} className="cursor-pointer rounded-full border border-[#0b1220]/20 px-5 py-2 text-sm font-medium hover:bg-[#eef2f8]">Alterar</button>
                </form>
            </div>
        </div>
    );
}
