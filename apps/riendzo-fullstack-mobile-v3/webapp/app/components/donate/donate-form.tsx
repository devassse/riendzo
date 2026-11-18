"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { donateAction, manualDonationAction, type DonateState } from "@/app/actions/donate-actions";

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
    // "Other" amount is controlled: the form resets itself after each submit and the manual panel needs the value
    const [other, setOther] = useState("");
    // Manual M-Pesa transfer (offered when online payments are not active yet)
    const [manualHidden, setManualHidden] = useState(false);
    const [manualDone, setManualDone] = useState<{ ref: string; amount: number } | null>(null);
    const [donorName, setDonorName] = useState("");
    const [manualError, setManualError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [sending, startSending] = useTransition();

    const refNow = state.ref ?? "";
    const thanks = state.status === "paid" && !pending && refNow !== closedRef;
    const close = () => { setClosedRef(refNow); setChoice("20"); setOther(""); setLeft(THANKS_SECONDS); };

    const manual = state.code === "inactive" ? state.manual : undefined;
    const showManual = !!manual && !pending && !manualHidden;
    const manualAmount = Math.round(Number(choice === "other" ? other.replace(",", ".") : choice));
    const manualAmountOk = Number.isFinite(manualAmount) && manualAmount >= 10 && manualAmount <= 100000;
    // A new online attempt brings the panel back (if it was closed after a manual donation)
    useEffect(() => { if (pending) setManualHidden(false); }, [pending]);

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
            const r = await manualDonationAction(manualAmount, donorName);
            if (r.ok) setManualDone({ ref: r.ref, amount: r.amount });
            else setManualError(r.message);
        });
    };
    const closeManual = () => { setManualDone(null); setManualHidden(true); setDonorName(""); setManualError(null); setChoice("20"); setOther(""); };

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

    if (manualDone) {
        return (
            <div role="status" className="rounded-3xl bg-[#35be12]/12 p-8 text-center">
                <p className="text-5xl" aria-hidden="true">💙</p>
                <h2 className="mt-2 mb-4 font-baloo text-2xl font-bold text-[#1c6e0a]">Obrigado pela sua doação!</h2>
                <p className="mt-1 text-[#2c5a1d]">
                    O teu apoio significa muito para a nossa equipa! 
                    <br />
                    Cada contribuição ajuda-nos a continuar a desenvolver o Riendzo, valorizar a nossa cultura e aproximar ainda mais as pessoas das nossas raízes.
                    <br /><br />
                    <b>Obrigado por fazeres parte desta iniciativa!</b>
                    
                </p>
                <p className="mt-3 text-xs text-[#4b5568]">Referência: {manualDone.ref}</p>
                <button type="button" onClick={closeManual} className="mt-4 cursor-pointer rounded-full border border-[#1c6e0a]/40 px-5 py-2 text-sm font-medium text-[#1c6e0a] hover:bg-white">Fechar</button>
            </div>
        );
    }

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
                        <input name="other" type="number" inputMode="numeric" min={10} max={100000} step={1} required autoFocus placeholder="Ex.: 250" value={other} onChange={(e) => setOther(e.target.value)} className={input} />
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

            <button type="submit" disabled={pending || showManual} className="w-full cursor-pointer rounded-full bg-[#0054b5] px-6 py-3.5 font-baloo text-base font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                {pending ? "A aguardar confirmação…" : "Efetuar Pagamento"}
            </button>

            {showManual && manual && (
                <section aria-labelledby="manual-title" className="space-y-4 border-t border-[#0b1220]/8 pt-6">
                    <div>
                        <p
                            data-dc-tpl="21"
                            style={{
                                margin: 0,
                                padding: '12px 14px',
                                borderRadius: 12,
                                background: 'rgb(244, 246, 249)',
                                color: 'rgb(74, 88, 112)',
                                fontSize: 13,
                                lineHeight: 1.5,
                            }}
                        >
                            Pagamento automático em breve. Por agora, a doação é feita por transferência M-Pesa: mostramos-lhe o número e o nome <em>cifrado</em>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#0b1220]/15 p-4">
                        <p className="text-sm text-[#5b6478]">Enviar por M-Pesa para</p>
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
                        <li>Insira o valor</li>
                        <li>Confirme com o seu PIN M-Pesa</li>
                        <li>Já está!</li>
                    </ol>

                    <label className="block text-xs font-medium">Opcional: diga-nos o seu nome para lhe agradecermos.
                        <input type="text" value={donorName} onChange={(e) => setDonorName(e.target.value)} maxLength={80} autoComplete="name" placeholder="O seu nome" className={input} />
                    </label>

                    {manualError && <p role="alert" className="rounded-2xl bg-[#e5533d]/10 px-4 py-3 text-sm text-[#b5311d]">{manualError}</p>}

                    <button type="button" onClick={sent} disabled={!manualAmountOk || sending} className="w-full cursor-pointer rounded-full bg-[#0054b5] px-6 py-3.5 font-baloo text-base font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                        {sending ? "A registar…" : "Já enviei"}
                    </button>
                </section>
            )}
        </form>
    );
}
