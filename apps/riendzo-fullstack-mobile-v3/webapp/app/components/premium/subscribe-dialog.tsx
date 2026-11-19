"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestManualPremiumAction, subscribePlacePremiumAction, subscribePremiumAction, type SubscribeState } from "@/app/actions/subscribe-actions";
import { PREMIUM_PLANS, saving } from "@/lib/premium-plans";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#0370d6]";
const METHODS = [
    { id: "mpesa", label: "M-Pesa", on: true },
    { id: "emola", label: "e-Mola", on: false },
    { id: "mkesh", label: "mKesh", on: false },
];
/** Seconds the success screen stays before the popup closes */
const DONE_SECONDS = 10;
export type PlaceRef = { collection: string; slug: string; title: string };
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
function Flow({ phone, onDone, busy, place }: { phone: string; onDone: () => void; busy: { current: boolean }; place?: PlaceRef }) {
    const [state, action, pending] = useActionState<SubscribeState, FormData>(place ? subscribePlacePremiumAction : subscribePremiumAction, {});
    const [plan, setPlan] = useState("");
    const [method, setMethod] = useState("");
    const [left, setLeft] = useState(DONE_SECONDS);
    // Transferência manual (aparece quando o pagamento automático falha ou não está ativo): o pedido fica "pendente" até o administrador aprovar
    const [manualDone, setManualDone] = useState<{ ref: string; amount: number; label: string } | null>(null);
    const [sender, setSender] = useState("");
    const [manualError, setManualError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [sending, startSending] = useTransition();
    const chosen = PREMIUM_PLANS.find((p) => p.id === plan);
    const paid = state.status === "paid" && !pending;
    const manual = state.manual && state.status && state.status !== "paid" && !pending ? state.manual : undefined;
    // While the PIN is awaited (or the request is being saved) the popup cannot be closed (Esc / click outside / ✕)
    useEffect(() => { busy.current = pending || sending; return () => { busy.current = false; }; }, [pending, sending, busy]);
    const step: 1 | 2 | 3 = paid || manualDone ? 3 : !plan ? 1 : method !== "mpesa" ? 2 : 3;

    const copyNumber = async () => {
        if (!manual) return;
        try {
            await navigator.clipboard.writeText(manual.phone.replace(/\D/g, ""));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* clipboard blocked: the number is on screen anyway */ }
    };
    const sent = () => {
        setManualError(null);
        startSending(async () => {
            const r = await requestManualPremiumAction({ plan, collection: place?.collection, slug: place?.slug, sender });
            if (r.ok) setManualDone({ ref: r.ref, amount: r.amount, label: r.label });
            else setManualError(r.message);
        });
    };

    useEffect(() => {
        if (!paid) return;
        const id = setInterval(() => setLeft((n) => n - 1), 1000);
        return () => clearInterval(id);
    }, [paid]);
    useEffect(() => { if (paid && left <= 0) onDone(); }, [paid, left, onDone]);

    if (manualDone) {
        return (
            <div role="status" className="space-y-3 p-8 text-center">
                <p className="text-5xl" aria-hidden="true">⏳</p>
                <h2 className="font-baloo text-2xl font-bold text-[#7a5200]">Pedido enviado!</h2>
                <p className="inline-block rounded-full bg-[#ffc14d]/30 px-4 py-1 text-sm font-medium text-[#7a5200]">Estado: pendente de aprovação</p>
                <p className="text-sm text-[#4b5568]">
                    Vamos confirmar a transferência de <b>{mt(manualDone.amount)}</b> ({manualDone.label}) {place ? <>para <b>{place.title}</b></> : null} e aprovar o pedido.
                    O Premium só fica ativo depois da aprovação e será avisado por e-mail.
                </p>
                <p className="text-xs text-[#4b5568]">Referência: {manualDone.ref}</p>
                <button type="button" onClick={onDone} className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90">Concluir</button>
            </div>
        );
    }

    if (paid) {
        return (
            <div role="status" className="space-y-3 p-8 text-center">
                <p className="text-5xl" aria-hidden="true">⭐</p>
                <h2 className="font-baloo text-2xl font-bold text-[#1c6e0a]">{place ? `${place.title} é agora Premium!` : "Bem-vindo ao Premium!"}</h2>
                <p className="text-sm text-[#2c5a1d]">Pagamento confirmado{state.until ? <>. {place ? "O Premium" : "O seu Premium"} está ativo até <b>{new Date(state.until).toLocaleDateString("pt-PT")}</b></> : ""}.</p>
                {place && <p className="text-xs text-[#4b5568]">Já pode receber e acompanhar os pedidos no menu <b>Pedidos</b>.</p>}
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
            {place && <><input type="hidden" name="collection" value={place.collection} /><input type="hidden" name="slug" value={place.slug} /></>}
            <input type="hidden" name="method" value={method} />
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 id="sub-title" className="font-baloo text-2xl font-bold">{place ? `Premium de ${place.title}` : "Subscrever o Premium"}</h2>
                    <div className="mt-2"><Steps step={step} /></div>
                </div>
                <button type="button" onClick={onDone} disabled={pending || sending} aria-label="Fechar" className="h-9 w-9 flex-none cursor-pointer rounded-full text-lg text-[#4b5568] hover:bg-[#eef2f8] disabled:opacity-30">✕</button>
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
                    <p className="rounded-2xl bg-[#f3f6fb] px-4 py-3 text-sm">Premium{place ? ` · ${place.title}` : ""} <b>{chosen.label}</b> · <b>{mt(chosen.price)}</b></p>

                    {pending && (
                        <div role="status" aria-live="polite" className="rounded-2xl border border-[#0370d6]/30 bg-[#f3f8ff] p-4 text-sm text-[#0b4a99]">
                            <p className="font-medium">📲 Verifique o seu telemóvel</p>
                            <p className="mt-1">Introduza o seu <b>PIN M-Pesa</b> para confirmar o pagamento. Não feche esta janela.</p>
                        </div>
                    )}
                    {state.status && !pending && (
                        <p role="alert" className={`rounded-2xl px-4 py-3 text-sm ${state.code === "inactive" ? "bg-[#f4f6f9] text-[#4a5870]" : state.status === "unknown" ? "bg-[#ffc14d]/25 text-[#6b4700]" : "bg-[#e5533d]/10 text-[#b5311d]"}`}>{state.message}</p>
                    )}
                    <button type="submit" disabled={pending || !!manual} className="w-full cursor-pointer rounded-full bg-[#0054b5] px-6 py-3.5 font-baloo text-base font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60">
                        {pending ? "A aguardar confirmação…" : "Efetuar Pagamento"}
                    </button>

                    {manual && (
                        <section aria-labelledby="manual-title" className="space-y-4 border-t border-[#0b1220]/8 pt-6">
                            <p id="manual-title" className="rounded-xl bg-[#f4f6f9] px-3.5 py-3 text-[13px] leading-relaxed text-[#4a5870]">
                                Pagamento automático em breve. Por agora, o Premium é pedido por <b>transferência M-Pesa</b>: envie o valor abaixo, toque em <b>Já enviei</b> e o pedido fica <b>pendente</b> até o administrador o aprovar.
                            </p>

                            <div className="rounded-2xl border border-[#0b1220]/15 p-4">
                                <p className="text-sm text-[#5b6478]">Enviar <b>{mt(chosen.price)}</b> por M-Pesa para</p>
                                <p className="mt-1 font-baloo text-3xl font-bold text-[#0b1220]">{manual.phone}</p>
                                {manual.name && <p className="mt-1 text-sm text-[#4b5568]">Nome que aparece: <b>{manual.name}</b></p>}
                                <button type="button" onClick={copyNumber} className="mt-3 w-full cursor-pointer rounded-full border border-[#0054b5] px-5 py-2.5 text-sm font-semibold text-[#0054b5] hover:bg-[#0054b5]/5">
                                    {copied ? "Número copiado ✓" : "Copiar número"}
                                </button>
                            </div>

                            <ol className="list-decimal space-y-1 pl-6 text-sm text-[#1f2937]">
                                <li>Marque <b>*150#</b></li>
                                <li>Escolha <b>Transferir dinheiro</b></li>
                                <li>M-Pesa (Sem Taxas)</li>
                                <li>Insira o número</li>
                                <li>Insira o valor: <b>{mt(chosen.price)}</b></li>
                                <li>Confirme com o seu PIN M-Pesa</li>
                                <li>Volte aqui e toque em <b>Já enviei</b></li>
                            </ol>

                            <label className="block text-xs font-medium">Opcional: número de onde enviou (ajuda-nos a encontrar o pagamento).
                                <input type="tel" inputMode="tel" value={sender} onChange={(e) => setSender(e.target.value)} maxLength={20} placeholder="84 123 4567" className={input} />
                            </label>

                            {manualError && <p role="alert" className="rounded-2xl bg-[#e5533d]/10 px-4 py-3 text-sm text-[#b5311d]">{manualError}</p>}

                            <button type="button" onClick={sent} disabled={sending} className="w-full cursor-pointer rounded-full bg-[#0054b5] px-6 py-3.5 font-baloo text-base font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                                {sending ? "A registar…" : "Já enviei"}
                            </button>
                        </section>
                    )}
                </div>
            )}
        </form>
    );
}

/** "Subscrever" button + popup with the whole purchase, step by step. */
export default function SubscribeDialog({ phone, renew = false, place }: { phone?: string; renew?: boolean; /** subscribing for an establishment (owner portal) instead of the member's own account */ place?: PlaceRef }) {
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
                {open && <Flow key={session} phone={prefill} onDone={hide} busy={busy} place={place} />}
            </dialog>
        </>
    );
}
