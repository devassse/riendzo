"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { subscribePremiumAction, type SubscribeState } from "@/app/actions/subscribe-actions";
import { PREMIUM_PLANS, saving } from "@/lib/premium-plans";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#0370d6]";
const METHODS = [
    { id: "mpesa", label: "M-Pesa", on: true },
    { id: "emola", label: "e-Mola", on: false },
    { id: "mkesh", label: "mKesh", on: false },
];
/** Seconds the success screen stays before the popup closes */
const DONE_SECONDS = 10;
const mt = (n: number) => `${n.toLocaleString("pt-PT")} MT`;

function Steps({ step }: { step: 1 | 2 | 3 }) {
    const names = ["Plano", "Pagamento", "Confirmação"];
    return (
        <ol className="flex items-center gap-2 text-xs" aria-label="Passos">
            {names.map((n, i) => (
                <li key={n} className="flex items-center gap-2" aria-current={step === i + 1 ? "step" : undefined}>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full font-bold ${step > i + 1 ? "bg-[#35be12] text-white" : step === i + 1 ? "bg-[#0054b5] text-white" : "bg-[#eef2f8] text-[#8a94a6]"}`}>{step > i + 1 ? "✓" : i + 1}</span>
                    <span className={step === i + 1 ? "font-medium text-[#0b1220]" : "text-[#5b6478]"}>{n}</span>
                    {i < 2 && <span className="h-px w-4 bg-[#0b1220]/15" aria-hidden="true" />}
                </li>
            ))}
        </ol>
    );
}

/** The step-by-step content: plan → payment method → M-Pesa number → PIN on the phone. Remounted on every opening. */
function Flow({ phone, onDone, busy }: { phone: string; onDone: () => void; busy: { current: boolean } }) {
    const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribePremiumAction, {});
    const [plan, setPlan] = useState("");
    const [method, setMethod] = useState("");
    const [left, setLeft] = useState(DONE_SECONDS);
    const chosen = PREMIUM_PLANS.find((p) => p.id === plan);
    const paid = state.status === "paid" && !pending;
    // While the PIN is awaited the popup cannot be closed (Esc / click outside / ✕)
    useEffect(() => { busy.current = pending; return () => { busy.current = false; }; }, [pending, busy]);
    const step: 1 | 2 | 3 = paid ? 3 : !plan ? 1 : method !== "mpesa" ? 2 : 3;

    useEffect(() => {
        if (!paid) return;
        const id = setInterval(() => setLeft((n) => n - 1), 1000);
        return () => clearInterval(id);
    }, [paid]);
    useEffect(() => { if (paid && left <= 0) onDone(); }, [paid, left, onDone]);

    if (paid) {
        return (
            <div role="status" className="space-y-3 p-8 text-center">
                <p className="text-5xl" aria-hidden="true">⭐</p>
                <h2 className="font-baloo text-2xl font-bold text-[#1c6e0a]">Bem-vindo ao Premium!</h2>
                <p className="text-sm text-[#2c5a1d]">Pagamento confirmado{state.until ? <>. O seu Premium está ativo até <b>{new Date(state.until).toLocaleDateString("pt-PT")}</b></> : ""}.</p>
                {state.message && <p className="text-xs text-[#4b5568]">{state.message}</p>}
                <p className="text-xs text-[#4b5568]">Referência: {state.ref}</p>
                <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-[#35be12]/20" aria-hidden="true">
                    <div className="h-full rounded-full bg-[#35be12] transition-[width] duration-1000 ease-linear" style={{ width: `${(Math.max(left, 0) / DONE_SECONDS) * 100}%` }} />
                </div>
                <p className="text-xs text-[#4b5568]">Esta janela fecha em {Math.max(left, 0)} s</p>
                <button type="button" onClick={onDone} className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90">Concluir</button>
            </div>
        );
    }

    return (
        <form action={action} className="space-y-6 p-6 sm:p-8">
            <input type="hidden" name="plan" value={plan} />
            <input type="hidden" name="method" value={method} />
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 id="sub-title" className="font-baloo text-2xl font-bold">Subscrever o Premium</h2>
                    <div className="mt-2"><Steps step={step} /></div>
                </div>
                <button type="button" onClick={onDone} disabled={pending} aria-label="Fechar" className="h-9 w-9 flex-none cursor-pointer rounded-full text-lg text-[#4b5568] hover:bg-[#eef2f8] disabled:opacity-30">✕</button>
            </div>

            {/* 1 · Plan */}
            <fieldset disabled={pending}>
                <legend className="text-sm font-medium">1. Escolha o plano</legend>
                <div className="mt-3 grid grid-cols-2 gap-3">
                    {PREMIUM_PLANS.map((p) => {
                        const s = saving(p);
                        return (
                            <label key={p.id} className="cursor-pointer">
                                <input type="radio" name="planPick" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} className="peer sr-only" />
                                <span className="relative block rounded-2xl border border-[#0b1220]/15 px-3 py-3 text-center transition-colors peer-checked:border-[#0054b5] peer-checked:bg-[#0054b5]/8 peer-focus-visible:outline peer-focus-visible:outline-2">
                                    <span className="block text-xs text-[#4b5568]">{p.label}</span>
                                    <span className="block font-baloo text-xl font-bold">{mt(p.price)}</span>
                                    {s > 0 && <span className="mt-0.5 block text-[11px] font-medium text-[#238a0c]">Poupa {mt(s)}</span>}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </fieldset>

            {/* 2 · Method (appears after the plan) */}
            {plan && (
                <fieldset disabled={pending}>
                    <legend className="text-sm font-medium">2. Como quer pagar?</legend>
                    <div className="mt-3 flex flex-wrap gap-3">
                        {METHODS.map((m) => m.on ? (
                            <button key={m.id} type="button" onClick={() => setMethod(m.id)} aria-pressed={method === m.id}
                                className={`cursor-pointer rounded-full border px-5 py-2.5 text-sm font-medium ${method === m.id ? "border-[#0054b5] bg-[#0054b5] text-white" : "border-[#0054b5] text-[#0054b5] hover:bg-[#0054b5]/8"}`}>{m.label}</button>
                        ) : (
                            <span key={m.id} aria-disabled="true" className="cursor-not-allowed rounded-full border border-[#0b1220]/10 px-5 py-2.5 text-sm font-medium text-[#8a94a6]">
                                {m.label}<span className="ml-1.5 text-[10px] font-normal uppercase">em breve</span>
                            </span>
                        ))}
                    </div>
                </fieldset>
            )}

            {/* 3 · M-Pesa number (appears after choosing M-Pesa) */}
            {plan && method === "mpesa" && chosen && (
                <div className="space-y-4">
                    <label className="block text-sm font-medium">3. Número M-Pesa a debitar
                        <input name="phone" type="tel" inputMode="tel" required disabled={pending} autoComplete="tel" autoFocus defaultValue={phone} placeholder="84 123 4567" className={input} />
                        <span className="mt-1 block text-xs font-normal text-[#5b6478]">Número Vodacom (84 ou 85). Vai receber um pedido de confirmação no telemóvel.</span>
                    </label>
                    <p className="rounded-2xl bg-[#f3f6fb] px-4 py-3 text-sm">Premium <b>{chosen.label}</b> · <b>{mt(chosen.price)}</b></p>

                    {pending && (
                        <div role="status" aria-live="polite" className="rounded-2xl border border-[#0370d6]/30 bg-[#f3f8ff] p-4 text-sm text-[#0b4a99]">
                            <p className="font-medium">📲 Verifique o seu telemóvel</p>
                            <p className="mt-1">Introduza o seu <b>PIN M-Pesa</b> para confirmar o pagamento. Não feche esta janela.</p>
                        </div>
                    )}
                    {state.status && !pending && (
                        <p role="alert" className={`rounded-2xl px-4 py-3 text-sm ${state.status === "unknown" ? "bg-[#ffc14d]/25 text-[#6b4700]" : "bg-[#e5533d]/10 text-[#b5311d]"}`}>{state.message}</p>
                    )}
                    <button type="submit" disabled={pending} className="w-full cursor-pointer rounded-full bg-[#0054b5] px-6 py-3.5 font-baloo text-base font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60">
                        {pending ? "A aguardar confirmação…" : "Efetuar Pagamento"}
                    </button>
                </div>
            )}
        </form>
    );
}

/** "Subscrever" button + popup with the whole purchase, step by step. */
export default function SubscribeDialog({ phone, renew = false }: { phone?: string; renew?: boolean }) {
    const router = useRouter();
    const ref = useRef<HTMLDialogElement>(null);
    const [session, setSession] = useState(0); // new value = fresh popup (state cleared)
    const [open, setOpen] = useState(false);
    const busy = useRef(false);

    // The native <dialog> gives focus trap, Esc to close and the backdrop
    const show = () => { setSession((n) => n + 1); setOpen(true); ref.current?.showModal(); };
    const hide = () => ref.current?.close();
    // Whatever way it closes, show the fresh Premium state on the page behind
    const onClosed = () => { setOpen(false); router.refresh(); };

    // M-Pesa numbers only prefill when they look like one
    const prefill = phone && /^258(84|85)\d{7}$/.test(phone) ? phone.slice(3) : "";

    return (
        <>
            <button type="button" onClick={show} className="cursor-pointer rounded-full bg-[#0054b5] px-7 py-3 font-baloo text-base font-medium text-white shadow-sm transition-opacity hover:opacity-90">
                {renew ? "Renovar Premium" : "Subscrever"}
            </button>
            <dialog ref={ref} aria-labelledby="sub-title" onClose={onClosed}
                onCancel={(e) => { if (busy.current) e.preventDefault(); }}
                onClick={(e) => { if (e.target === ref.current && !busy.current) hide(); }}
                className="m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto rounded-3xl border-0 bg-white p-0 text-[#0b1220] shadow-2xl backdrop:bg-[#0b1220]/60 backdrop:backdrop-blur-sm">
                {open && <Flow key={session} phone={prefill} onDone={hide} busy={busy} />}
            </dialog>
        </>
    );
}
