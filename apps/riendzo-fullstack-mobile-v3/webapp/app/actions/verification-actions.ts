"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionMember } from "@/lib/members-auth";
import { isVerified, markVerified } from "@/lib/members";
import { checkCode, issueCode, type Channel } from "@/lib/verification";
import { clearFailures, isLockedOut, registerFailure } from "@/lib/cms/auth";

export type VerifyState = { error?: string; ok?: string };

const safeNext = (n: unknown) => (typeof n === "string" && /^\/(?!\/)[\w\-/?=&%.#]*$/.test(n) ? n : "/conta");

async function ip() {
    return (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

/** "Send me a code": by e-mail or by SMS. */
export async function sendVerificationCodeAction(_: VerifyState, fd: FormData): Promise<VerifyState> {
    const m = await getSessionMember();
    if (!m) redirect("/conta/entrar");
    if (isVerified(m)) redirect("/conta");

    const who = `vsend:${await ip()}`;
    if (isLockedOut(who)) return { error: "Demasiados pedidos. Tente novamente dentro de 15 minutos." };
    registerFailure(who); // every request counts: 5 per 15 minutes per IP

    const channel: Channel = fd.get("channel") === "sms" ? "sms" : "email";
    const r = await issueCode(m, channel);
    if (!r.ok) return { error: r.error };
    return { ok: channel === "email" ? "Código enviado por e-mail." : "Código enviado por SMS." };
}

/** Confirms the account with the typed code. */
export async function verifyCodeAction(_: VerifyState, fd: FormData): Promise<VerifyState> {
    const m = await getSessionMember();
    if (!m) redirect("/conta/entrar");
    const next = safeNext(fd.get("next"));
    if (isVerified(m)) redirect(next);

    const key = `verify:${m.id}`;
    if (isLockedOut(key)) return { error: "Demasiadas tentativas. Tente novamente dentro de 15 minutos." };
    const code = String(fd.get("code") ?? "").replace(/\D/g, "");
    if (code.length !== 6) return { error: "Escreva os 6 dígitos do código." };

    const r = await checkCode(m.id, code);
    if (!r.ok) { registerFailure(key); return { error: r.error }; }
    clearFailures(key);
    await markVerified(m.id, r.channel);
    // New accounts go on to complete the profile
    redirect(fd.get("novo") === "1" && next === "/conta" ? "/conta/perfil?novo=1" : next);
}
