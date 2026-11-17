"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendVerificationCodeAction, verifyCodeAction, type VerifyState } from "@/app/actions/verification-actions";
import { logoutMemberAction } from "@/app/actions/member-actions";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-[#f3f6fb] px-4 py-3 text-center font-baloo text-3xl font-bold tracking-[0.5em] text-[#0b1220] outline-none transition-colors focus:border-[#0370d6] focus:bg-white";
const btn = "w-full cursor-pointer rounded-full bg-[#0054b5] px-5 py-3 font-baloo text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60";
const ghost = "cursor-pointer rounded-full border border-[#0b1220]/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-[#eef2f8] disabled:cursor-not-allowed disabled:opacity-50";

type Status = { channel: "email" | "sms"; sentAt: number; exp: number; devCode?: string } | null;

export function VerifyForm({ next, isNew, firstName, email, phone, status, minutes, cooldown }: {
    next: string; isNew: boolean; firstName: string; email?: string; phone?: string; status: Status; minutes: number; cooldown: number;
}) {
    const router = useRouter();
    const [vs, verify, verifying] = useActionState<VerifyState, FormData>(verifyCodeAction, {});
    const [ss, send, sending] = useActionState<VerifyState, FormData>(sendVerificationCodeAction, {});
    const [code, setCode] = useState("");
    const [now, setNow] = useState(() => Date.now());
    const codeRef = useRef<HTMLInputElement>(null);

    // After a new code is sent, reload the server data (where it went, development code…)
    useEffect(() => { if (ss.ok) router.refresh(); }, [ss, router]);
    // Countdown of the "send again" lock
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const wait = status ? Math.max(0, Math.ceil(cooldown - (now - status.sentAt) / 1000)) : 0;
    const where = status ? (status.channel === "email" ? email : phone) : undefined;

    return (
        <div className="mt-6 space-y-5">
            {isNew && <p role="status" className="rounded-xl bg-[#2f9e44]/12 px-3 py-2 text-sm text-[#237a35]">Conta criada, {firstName}! Falta só confirmar que o contacto é seu.</p>}

            <p className="text-sm text-[#4b5568]">
                {status && where
                    ? <>Enviámos um código de 6 dígitos {status.channel === "email" ? "para o e-mail" : "por SMS para"} <b className="text-[#0b1220]">{where}</b>. É válido durante {minutes} minutos.</>
                    : <>Escolha como quer receber o código de 6 dígitos: por e-mail ou por SMS.</>}
            </p>

            {status?.devCode && (
                <div role="note" className="rounded-2xl border border-[#d98a00]/50 bg-[#fff6dd] px-4 py-3 text-sm text-[#5a3b00]">
                    <p className="font-medium">🛠️ Modo de desenvolvimento</p>
                    <p className="mt-0.5 text-xs">Nenhum {status.channel === "email" ? "e-mail" : "SMS"} foi enviado (ainda não está configurado). O código também está na consola do servidor.</p>
                    <p className="mt-2 flex items-center gap-3">
                        <span className="font-baloo text-2xl font-bold tracking-[0.3em]">{status.devCode}</span>
                        <button type="button" onClick={() => { setCode(status.devCode!); codeRef.current?.focus(); }} className="cursor-pointer rounded-full bg-[#d98a00] px-3 py-1 text-xs font-medium text-white">Preencher</button>
                    </p>
                </div>
            )}

            <form action={verify} className="space-y-4">
                <input type="hidden" name="next" value={next} />
                {isNew && <input type="hidden" name="novo" value="1" />}
                <label className="block text-xs font-medium">
                    Código de verificação
                    <input
                        ref={codeRef} name="code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required placeholder="••••••" className={input}
                    />
                </label>
                {vs.error && <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-xs text-[#b5311d]">{vs.error}</p>}
                <button type="submit" disabled={verifying || code.length !== 6} className={btn}>{verifying ? "A confirmar…" : "Confirmar conta"}</button>
            </form>

            <div className="rounded-2xl bg-[#f3f6fb] p-4">
                <p className="text-xs font-medium text-[#0b1220]">Não recebeu o código?</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {email && (
                        <form action={send}><input type="hidden" name="channel" value="email" />
                            <button disabled={sending || wait > 0} className={ghost}>✉️ Enviar por e-mail</button></form>
                    )}
                    {phone && (
                        <form action={send}><input type="hidden" name="channel" value="sms" />
                            <button disabled={sending || wait > 0} className={ghost}>💬 Enviar por SMS</button></form>
                    )}
                </div>
                {wait > 0 && <p className="mt-2 text-xs text-[#5b6478]">Pode pedir outro código dentro de {wait} s.</p>}
                {ss.error && <p role="alert" className="mt-2 text-xs text-[#b5311d]">{ss.error}</p>}
                {ss.ok && <p role="status" className="mt-2 text-xs text-[#237a35]">{ss.ok}</p>}
                <p className="mt-3 text-[11px] text-[#5b6478]">Veja também a pasta de spam. Enquanto não confirmar, voltará sempre a esta página ao entrar.</p>
            </div>

            <form action={logoutMemberAction} className="text-center">
                <button className="cursor-pointer text-xs text-[#5b6478] hover:underline">Sair e usar outra conta</button>
            </form>
        </div>
    );
}
