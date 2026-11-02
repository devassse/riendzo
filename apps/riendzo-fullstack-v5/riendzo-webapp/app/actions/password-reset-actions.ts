"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { findMemberByEmail, findMemberByPhone, setMemberPassword } from "@/lib/members";
import { findUserByEmail, findUserByPhone, normalizePhone, setUserPassword } from "@/lib/cms/users";
import { consumeReset, createReset, peekReset, type ResetKind } from "@/lib/password-reset";
import { sendMail } from "@/lib/mailer";
import { sendSms } from "@/lib/sms";
import { isLockedOut, registerFailure } from "@/lib/cms/auth";
import { staffPasswordProblem } from "@/lib/cms/password";

export type ResetState = { ok?: string; error?: string };

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function ip() {
    return (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

async function request(kind: ResetKind, fd: FormData): Promise<ResetState> {
    const who = `reset:${await ip()}`;
    if (isLockedOut(who)) return { error: "Demasiados pedidos. Tente novamente dentro de 15 minutos." };
    registerFailure(who); // every request counts: 5 per 15 minutes per IP

    // e-mail or phone: the link goes by e-mail, or by SMS when a phone number was typed
    const typed = String(fd.get("identifier") ?? fd.get("email") ?? "").trim();
    const byEmail = typed.includes("@");
    const email = typed.toLowerCase();
    const phone = normalizePhone(typed);
    if (byEmail ? !EMAIL.test(email) : !/^\d{9,15}$/.test(phone)) return { error: "Indique um e-mail ou um telefone válido." };

    const account = byEmail
        ? (kind === "member" ? await findMemberByEmail(email) : await findUserByEmail(email))
        : (kind === "member" ? await findMemberByPhone(phone) : await findUserByPhone(phone));
    if (account) {
        const token = await createReset(kind, account.id);
        const locale = String(fd.get("locale") ?? "");
        const lang = (routing.locales as readonly string[]).includes(locale) ? locale : routing.defaultLocale;
        const link = kind === "member" ? `${SITE}/${lang}/conta/repor?token=${token}` : `${SITE}/admin/repor?token=${token}`;
        if (!byEmail) {
            await sendSms(phone, `Riendzo: para criar uma nova palavra-passe abra ${link} (válido 1 hora). Se não foi você, ignore.`);
        } else await sendMail({
            to: email,
            subject: "Repor a palavra-passe | Riendzo",
            text: `Recebemos um pedido para repor a sua palavra-passe.\n\nAbra este link (válido durante 1 hora):\n${link}\n\nSe não foi você, ignore esta mensagem: a sua palavra-passe não muda.\n\nRiendzo`,
            html: `<p>Recebemos um pedido para repor a sua palavra-passe.</p><p><a href="${link}" style="background:#0054b5;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Criar nova palavra-passe</a></p><p style="color:#5b6478;font-size:13px">O link é válido durante 1 hora. Se não foi você, ignore esta mensagem: a sua palavra-passe não muda.</p>`,
        });
    }
    // Same answer whether or not the account exists (no account enumeration)
    return { ok: "Se existir uma conta com estes dados, enviámos um link para criar uma nova palavra-passe (válido durante 1 hora). Veja também a pasta de spam ou as mensagens SMS." };
}

export async function requestMemberResetAction(_: ResetState, fd: FormData) {
    return request("member", fd);
}
export async function requestStaffResetAction(_: ResetState, fd: FormData) {
    return request("staff", fd);
}

async function reset(kind: ResetKind, fd: FormData): Promise<ResetState> {
    const token = String(fd.get("token") ?? "");
    const next = String(fd.get("next") ?? "");
    if (next !== String(fd.get("confirm") ?? "")) return { error: "As palavras-passe não são iguais." };
    const problem = staffPasswordProblem(next);
    if (problem) return { error: problem };

    const id = await peekReset(kind, token);
    if (!id) return { error: "Este link já não é válido. Peça um novo." };
    const res = kind === "member" ? await setMemberPassword(id, next) : await setUserPassword(id, next);
    if (!res.ok) return { error: res.error };
    await consumeReset(kind, token);

    if (kind === "member") redirect(`/${routing.defaultLocale}/conta/entrar?reset=1`);
    redirect("/admin/login?reset=1");
}

export async function resetMemberPasswordAction(_: ResetState, fd: FormData) {
    return reset("member", fd);
}
export async function resetStaffPasswordAction(_: ResetState, fd: FormData) {
    return reset("staff", fd);
}
