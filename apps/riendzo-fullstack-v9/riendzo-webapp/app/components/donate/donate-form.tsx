"use client";

import { useActionState, useEffect, useState } from "react";
import { donateAction, type DonateState } from "@/app/actions/donate-actions";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#0370d6]";
const AMOUNTS = [10, 20, 50, 100] as const;
/** Seconds the thank-you message stays before the form comes back */
const THANKS_SECONDS = 15;
const METHODS = [
    { id: "mpesa", label: "M-Pesa", on: true },
    { id: "emola", label: "e-Mola", on: false },
    { id: "mkesh", label: "mKesh", on: false },
];

export default function DonateForm() {
    const [state, action, pending] = useActionState<DonateState, FormData>(donateAction, {});
    const [choice, setChoice] = useState<string>("20");
    // Reference of the donation whose thank-you message was already closed (by the timer or the button)
    const [closedRef, setClosedRef] = useState<string | null>(null);
    const [left, setLeft] = useState(THANKS_SECONDS);

    const refNow = state.ref ?? "";
    const thanks = state.status === "paid" && !pending && refNow !== closedRef;
    const close = () => { setClosedRef(refNow); setChoice("20"); setLeft(THANKS_SECONDS); };

    // Countdown of the thank-you message: one tick per second...
    useEffect(() => {
        if (!thanks) return;
        const id = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
        return () => clearInterval(id);
    }, [thanks, refNow]);
    // ...and at 0 the message closes and the form comes back, empty
    useEffect(() => {
        if (thanks && left === 0) close();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [thanks, left]);

    if (thanks) {
        return (
            <div role="status" className="rounded-3xl bg-[#35be12]/12 p-8 text-center">
                <p className="text-5xl" aria-hidden="true">💙</p>
                <h2 className="mt-2 font-baloo text-2xl font-bold text-[#1c6e0a]">Obrigado pela sua doação!</h2>
                <p className="mt-1 text-[#2c5a1d]">{state.amount?.toLocaleString("pt-PT")} MT recebidos. Ajuda-nos a manter a Riendzo a crescer.</p>
                {state.message && <p className="mt-2 text-xs text-[#4b5568]">{state.message}</p>}
                <p className="mt-3 text-xs text-[#4b5568]">Referência: {state.ref}</p>
                <div className="mx-auto mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-[#35be12]/20" aria-hidden="true">
                    <div className="h-full rounded-full bg-[#35be12] transition-[width] duration-1000 ease-linear" style={{ width: `${(left / THANKS_SECONDS) * 100}%` }} />
                </div>
                <p className="mt-2 text-xs text-[#4b5568]">Esta mensagem fecha em {left} s</p>
                <button type="button" onClick={close} className="mt-3 cursor-pointer rounded-full border border-[#1c6e0a]/40 px-5 py-2 text-sm font-medium text-[#1c6e0a] hover:bg-white">Fechar</button>
            </div>
        );
    }

    return (
        <form key={closedRef ?? "new"} action={action} className="space-y-6 rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm sm:p-8">
            <input type="hidden" name="method" value="mpesa" />

            <fieldset disabled={pending}>
                <legend className="text-sm font-medium">Quanto quer doar? (meticais)</legend>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {AMOUNTS.map((a) => (
                        <label key={a} className="cursor-pointer">
                            <input type="radio" name="choice" value={a} checked={choice === String(a)} onChange={() => setChoice(String(a))} className="peer sr-only" />
                            <span className="block rounded-2xl border border-[#0b1220]/15 py-3 text-center font-baloo text-lg font-bold transition-colors peer-checked:border-[#0054b5] peer-checked:bg-[#0054b5] peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2">{a} MT</span>
                        </label>
                    ))}
                    <label className="cursor-pointer">
                        <input type="radio" name="choice" value="other" checked={choice === "other"} onChange={() => setChoice("other")} className="peer sr-only" />
                        <span className="block rounded-2xl border border-[#0b1220]/15 py-3 text-center font-baloo text-lg font-bold transition-colors peer-checked:border-[#0054b5] peer-checked:bg-[#0054b5] peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2">Outro</span>
                    </label>
                </div>
                {choice === "other" && (
                    <label className="mt-3 block text-xs font-medium">Valor em MT (mínimo 10)
                        <input name="other" type="number" inputMode="numeric" min={10} max={100000} step={1} required autoFocus placeholder="Ex.: 250" className={input} />
                    </label>
                )}
            </fieldset>

            <fieldset disabled={pending}>
                <legend className="text-sm font-medium">Como quer pagar?</legend>
                <div className="mt-3 flex flex-wrap gap-3">
                    {METHODS.map((m) => (
                        <span key={m.id} aria-disabled={!m.on} className={`rounded-full border px-5 py-2.5 text-sm font-medium ${m.on ? "border-[#0054b5] bg-[#0054b5]/8 text-[#0054b5]" : "cursor-not-allowed border-[#0b1220]/10 text-[#8a94a6]"}`}>
                            {m.label}{!m.on && <span className="ml-1.5 text-[10px] font-normal uppercase">em breve</span>}
                        </span>
                    ))}
                </div>
            </fieldset>

            <label className="block text-sm font-medium">Número M-Pesa a debitar
                <input name="phone" type="tel" inputMode="tel" required disabled={pending} autoComplete="tel" placeholder="84 123 4567" className={input} />
                <span className="mt-1 block text-xs font-normal text-[#5b6478]">Número Vodacom (84 ou 85). Vai receber um pedido de confirmação no telemóvel.</span>
            </label>

            {pending && (
                <div role="status" aria-live="polite" className="rounded-2xl border border-[#0370d6]/30 bg-[#f3f8ff] p-4 text-sm text-[#0b4a99]">
                    <p className="font-medium">📲 Verifique o seu telemóvel</p>
                    <p className="mt-1">Introduza o seu <b>PIN M-Pesa</b> para confirmar o pagamento. Não feche esta página.</p>
                </div>
            )}
            {state.status && state.status !== "paid" && !pending && (
                <p role="alert" className={`rounded-2xl px-4 py-3 text-sm ${state.status === "unknown" ? "bg-[#ffc14d]/25 text-[#6b4700]" : "bg-[#e5533d]/10 text-[#b5311d]"}`}>{state.message}</p>
            )}

            <button type="submit" disabled={pending} className="w-full cursor-pointer rounded-full bg-[#0054b5] px-6 py-3.5 font-baloo text-base font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60">
                {pending ? "A aguardar confirmação…" : "Efetuar Pagamento"}
            </button>
        </form>
    );
}