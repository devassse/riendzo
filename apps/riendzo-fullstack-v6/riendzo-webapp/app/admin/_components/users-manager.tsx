"use client";

import { useActionState, useState } from "react";
import { createUserAction, deleteUserAction, updateUserAction, type FormState } from "../actions";
import type { PublicUser } from "@/lib/cms/users";
import ConfirmButton from "./confirm-button";
import { inputClass } from "./fields";
import Req, { RequiredNote } from "@/app/components/utils/req";
import { useRouter } from "next/navigation";
import { COLLECTIONS } from "@/lib/cms/collections";

export type Establishment = { collection: string; slug: string; label: string };

/** 12 characters, letters and numbers (at least one of each), from the browser's secure random generator. */
function generatePassword() {
    const letters = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";
    const digits = "23456789";
    const all = letters + digits;
    const pick = (set: string) => set[crypto.getRandomValues(new Uint32Array(1))[0] % set.length];
    const chars = [pick(letters), pick(digits), ...Array.from({ length: 10 }, () => pick(all))];
    for (let i = chars.length - 1; i > 0; i--) {
        const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
}
const ROLE: Record<string, string> = { admin: "Administrador", editor: "Editor", owner: "Proprietário" };

/** Picks the establishments a "Proprietário" can manage. Submitted as "collection:slug" lines. */
function OwnerPicker({ options, initial }: { options: Establishment[]; initial: { collection: string; slug: string }[] }) {
    const [refs, setRefs] = useState(initial);
    const [pick, setPick] = useState("");
    const label = (r: { collection: string; slug: string }) => options.find((o) => o.collection === r.collection && o.slug === r.slug)?.label ?? `${r.collection}/${r.slug}`;
    return (
        <div>
            <input type="hidden" name="ownerOf" value={refs.map((r) => `${r.collection}:${r.slug}`).join("\n")} />
            <div className="flex flex-wrap gap-1.5">
                {refs.map((r) => <span key={`${r.collection}:${r.slug}`} className="flex items-center gap-1 rounded-full bg-[#eef2f8] px-3 py-1 text-xs">{label(r)}<button type="button" aria-label="Remover" onClick={() => setRefs(refs.filter((x) => x !== r))} className="cursor-pointer text-[#5b6478] hover:text-[#d23b25]">×</button></span>)}
            </div>
            <div className="mt-2 flex gap-2">
                <select value={pick} onChange={(e) => setPick(e.target.value)} className={inputClass} aria-label="Estabelecimento">
                    <option value="">Escolha um estabelecimento…</option>
                    {options.filter((o) => !refs.some((r) => r.collection === o.collection && r.slug === o.slug)).map((o) => <option key={`${o.collection}:${o.slug}`} value={`${o.collection}:${o.slug}`}>{o.label}</option>)}
                </select>
                <button type="button" disabled={!pick} onClick={() => { const [collection, slug] = pick.split(":"); setRefs([...refs, { collection, slug }]); setPick(""); }} className="cursor-pointer rounded-full border border-[#0b1220]/20 px-4 text-sm disabled:opacity-40">Adicionar</button>
            </div>
        </div>
    );
}

function UserForm({ user, options, mode }: { user?: PublicUser; options: Establishment[]; mode: "create" | "edit" }) {
    const [s, action, pending] = useActionState<FormState, FormData>(mode === "create" ? createUserAction : updateUserAction, {});
    const [role, setRole] = useState(user?.role ?? "owner");
    const [pw, setPw] = useState("");
    return (
        <form action={action} className="space-y-4">
            {user && <input type="hidden" name="id" value={user.id} />}
            <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium">Nome<Req /><input name="name" required defaultValue={user?.name} className={inputClass} /></label>
                <label className="block text-xs font-medium">Utilizador (login)<Req /><input name="username" required defaultValue={user?.username} autoComplete="off" className={inputClass} /></label>
                <label className="block text-xs font-medium">Perfil
                    <select name="role" value={role} onChange={(e) => setRole(e.target.value as typeof role)} className={inputClass}>
                        <option value="owner">Proprietário (restaurante, hotel, rent-a-car…)</option><option value="editor">Editor (todo o conteúdo)</option><option value="admin">Administrador</option>
                    </select>
                </label>
                <label className="block text-xs font-medium">E-mail<input name="email" type="email" defaultValue={user?.email} autoComplete="off" placeholder="para notificações e recuperação" className={inputClass} /></label>
                <label className="block text-xs font-medium">Telefone<input name="phone" type="tel" defaultValue={user?.phone ? `+${user.phone}` : ""} autoComplete="off" placeholder="84 123 4567" className={inputClass} /></label>
                <label className="block text-xs font-medium sm:col-span-2">{mode === "create" ? "Palavra-passe inicial" : "Nova palavra-passe (opcional)"}{mode === "create" && <Req />}
                    <span className="mt-1.5 flex gap-2">
                        <input name="password" value={pw} onChange={(e) => setPw(e.target.value)} type="text" autoComplete="off" minLength={8} pattern="(?=.*[A-Za-z])(?=.*\d).{8,}" title="Pelo menos 8 caracteres, com letras e números" required={mode === "create"} placeholder="letras e números, mín. 8" className={`${inputClass} !mt-0 font-mono`} />
                        <button type="button" onClick={() => setPw(generatePassword())} className="cursor-pointer whitespace-nowrap rounded-full border border-[#0b1220]/20 px-4 text-sm hover:bg-[#eef2f8]">Gerar</button>
                    </span>
                    <span className="mt-1 block text-[11px] font-normal text-[#5b6478]">Alfanumérica: letras e números. Envie-a ao utilizador por um canal seguro.</span>
                </label>
            </div>
            {role === "owner" && <div><p className="mb-1 text-xs font-medium">Estabelecimentos que pode gerir</p><OwnerPicker options={options} initial={user?.ownerOf ?? []} /><NewEstablishment /></div>}
            {mode === "edit" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={user?.active} /> Conta ativa</label>}
            {s.error && <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-sm text-[#b5311d]">{s.error}</p>}
            {s.ok && <p role="status" className="rounded-xl bg-[#2f9e44]/12 px-3 py-2 text-sm text-[#237a35]">{s.ok}</p>}
            <RequiredNote />
            <button disabled={pending} className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">{mode === "create" ? "Criar utilizador" : "Guardar"}</button>
        </form>
    );
}

/** Not in the list? Create the establishment (new tab), then refresh the list here without losing what was typed. */
function NewEstablishment() {
    const router = useRouter();
    const kinds = COLLECTIONS.filter((c) => c.directory);
    const [kind, setKind] = useState(kinds[0]?.id ?? "");
    return (
        <div className="mt-3 rounded-2xl border border-dashed border-[#0054b5]/40 bg-[#0054b5]/[0.04] p-3">
            <p className="text-xs font-medium text-[#0b1220]">Não encontra o estabelecimento na lista?</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
                <select aria-label="Tipo de estabelecimento" value={kind} onChange={(e) => setKind(e.target.value)} className="rounded-xl border border-[#0b1220]/15 bg-white px-3 py-1.5 text-sm">
                    {kinds.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <a href={`/admin/c/${kind}/new`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#0054b5] px-4 py-1.5 text-sm font-medium text-white hover:opacity-90">+ Criar novo estabelecimento ↗</a>
                <button type="button" onClick={() => router.refresh()} className="cursor-pointer rounded-full border border-[#0b1220]/20 px-4 py-1.5 text-sm hover:bg-[#0b1220]/5">↻ Atualizar lista</button>
            </div>
            <p className="mt-1 text-[11px] text-[#5b6478]">Abre num separador novo. Depois de guardar, volte aqui e carregue em “Atualizar lista”.</p>
        </div>
    );
}

export default function UsersManager({ users, options }: { users: PublicUser[]; options: Establishment[] }) {
    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
            <section className="space-y-3">
                {users.length === 0 && <p className="rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-8 text-center text-sm text-[#4b5568]">Ainda não há utilizadores. Crie o primeiro ao lado.</p>}
                {users.map((u) => (
                    <details key={u.id} className="rounded-3xl border border-[#0b1220]/8 bg-white p-4 shadow-sm">
                        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 [&::-webkit-details-marker]:hidden">
                            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#0054b5] font-baloo font-bold text-white">{u.avatar /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={u.avatar} alt="" className="h-full w-full object-cover" /> : u.name.slice(0, 2).toUpperCase()}</span>
                            <span className="min-w-0 flex-1"><span className="block font-baloo font-medium">{u.name}</span><span className="text-xs text-[#5b6478]">@{u.username}{u.email ? ` · ${u.email}` : ""}{u.role === "owner" && u.ownerOf.length ? ` · ${u.ownerOf.length} estabelecimento(s)` : ""}{u.lastLogin ? ` · último acesso ${new Date(u.lastLogin).toLocaleDateString("pt-PT")}` : ""}</span></span>
                            <span className="rounded-full bg-[#eef2f8] px-3 py-1 text-xs">{ROLE[u.role]}</span>
                            <span className={`rounded-full px-3 py-1 text-xs ${u.active ? "bg-[#35be12]/15 text-[#238a0c]" : "bg-[#d23b25]/12 text-[#b5311d]"}`}>{u.active ? "Ativo" : "Desativado"}</span>
                        </summary>
                        <div className="mt-5 border-t border-[#0b1220]/8 pt-5">
                            <UserForm user={u} options={options} mode="edit" />
                            <form action={deleteUserAction} className="mt-4"><input type="hidden" name="id" value={u.id} /><input type="hidden" name="username" value={u.username} /><ConfirmButton message={`Eliminar o utilizador “${u.username}”?`} className="cursor-pointer text-sm text-[#d23b25] hover:underline">Eliminar utilizador</ConfirmButton></form>
                        </div>
                    </details>
                ))}
            </section>
            <aside className="h-fit rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm xl:sticky xl:top-24">
                <h2 className="font-baloo text-xl font-bold">Novo utilizador</h2>
                <p className="mb-4 mt-1 text-xs text-[#5b6478]">Ao entrar, cada perfil é encaminhado automaticamente para a sua área: administradores e editores para o BackOffice, proprietários para o portal do seu estabelecimento.</p>
                <UserForm options={options} mode="create" />
            </aside>
        </div>
    );
}
