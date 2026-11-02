"use client";

import { useActionState, useState } from "react";
import { createUserAction, deleteUserAction, updateUserAction, type FormState } from "../actions";
import type { PublicUser } from "@/lib/cms/users";
import ConfirmButton from "./confirm-button";
import { inputClass } from "./fields";

export type Establishment = { collection: string; slug: string; label: string };
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
    return (
        <form action={action} className="space-y-4">
            {user && <input type="hidden" name="id" value={user.id} />}
            <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium">Nome<input name="name" required defaultValue={user?.name} className={inputClass} /></label>
                <label className="block text-xs font-medium">Utilizador (login)<input name="username" required defaultValue={user?.username} autoComplete="off" className={inputClass} /></label>
                <label className="block text-xs font-medium">Perfil
                    <select name="role" value={role} onChange={(e) => setRole(e.target.value as typeof role)} className={inputClass}>
                        <option value="owner">Proprietário (restaurante, hotel, rent-a-car…)</option><option value="editor">Editor (todo o conteúdo)</option><option value="admin">Administrador</option>
                    </select>
                </label>
                <label className="block text-xs font-medium">{mode === "create" ? "Palavra-passe inicial" : "Nova palavra-passe (opcional)"}<input name="password" type="text" autoComplete="off" minLength={8} required={mode === "create"} placeholder="mínimo 8 caracteres" className={inputClass} /></label>
            </div>
            {role === "owner" && <div><p className="mb-1 text-xs font-medium">Estabelecimentos que pode gerir</p><OwnerPicker options={options} initial={user?.ownerOf ?? []} /></div>}
            {mode === "edit" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={user?.active} /> Conta ativa</label>}
            {s.error && <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-sm text-[#b5311d]">{s.error}</p>}
            {s.ok && <p role="status" className="rounded-xl bg-[#2f9e44]/12 px-3 py-2 text-sm text-[#237a35]">{s.ok}</p>}
            <button disabled={pending} className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">{mode === "create" ? "Criar utilizador" : "Guardar"}</button>
        </form>
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
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0054b5] font-baloo font-bold text-white">{u.name.slice(0, 2).toUpperCase()}</span>
                            <span className="min-w-0 flex-1"><span className="block font-baloo font-medium">{u.name}</span><span className="text-xs text-[#5b6478]">@{u.username}{u.role === "owner" && u.ownerOf.length ? ` · ${u.ownerOf.length} estabelecimento(s)` : ""}{u.lastLogin ? ` · último acesso ${new Date(u.lastLogin).toLocaleDateString("pt-PT")}` : ""}</span></span>
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
