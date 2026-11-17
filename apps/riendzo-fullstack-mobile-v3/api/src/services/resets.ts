import crypto from "node:crypto";
import { prisma } from "../db";

export type ResetKind = "member" | "staff";
const TTL = 60 * 60 * 1000;
const sha = (v: string) => crypto.createHash("sha256").update(v).digest("hex");

/** New single-use token (valid 1 hour); replaces any older one for the account. */
export async function createReset(kind: ResetKind, accountId: string) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.$transaction([
        prisma.passwordReset.deleteMany({ where: { kind, accountId } }),
        prisma.passwordReset.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
        prisma.passwordReset.create({ data: { kind, accountId, tokenHash: sha(token), expiresAt: new Date(Date.now() + TTL) } }),
    ]);
    return token;
}

/** Returns the account id for a valid token and uses it up. */
export async function consumeReset(kind: ResetKind, token: string) {
    const row = await prisma.passwordReset.findUnique({ where: { tokenHash: sha(token) } });
    if (!row || row.kind !== kind || row.expiresAt < new Date()) return null;
    await prisma.passwordReset.delete({ where: { id: row.id } });
    return row.accountId;
}

export const resetMail = (link: string) => ({
    subject: "Repor a palavra-passe | Riendzo",
    text: `Recebemos um pedido para repor a sua palavra-passe.\n\nAbra este link (válido durante 1 hora):\n${link}\n\nSe não foi você, ignore esta mensagem.\n\nRiendzo`,
    html: `<p>Recebemos um pedido para repor a sua palavra-passe.</p><p><a href="${link}">Criar nova palavra-passe</a></p><p>O link é válido durante 1 hora. Se não foi você, ignore esta mensagem.</p>`,
});
