/** Session of Riendzo AI members (separate cookie from the BackOffice). Server only. */
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { authConfig, sign } from "@/lib/cms/auth";
import { getMemberById, type PublicMember } from "@/lib/members";

const COOKIE = "riendzo_member";
const MAX_AGE = 60 * 60 * 24 * 30;
const isProd = process.env.NODE_ENV === "production";

export async function createMemberSession(id: string) {
    const { secret } = authConfig();
    const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
    const payload = Buffer.from(JSON.stringify({ m: id, exp })).toString("base64url");
    (await cookies()).set(COOKIE, `${payload}.${sign(payload, secret)}`, {
        httpOnly: true, sameSite: "lax", secure: isProd, path: "/", maxAge: MAX_AGE,
    });
}

export async function destroyMemberSession() {
    (await cookies()).delete(COOKIE);
}

export async function getMember(): Promise<PublicMember | null> {
    const { secret, configured } = authConfig();
    if (!configured) return null;
    const token = (await cookies()).get(COOKIE)?.value;
    const [payload, sig] = (token ?? "").split(".");
    if (!payload || !sig) return null;
    const expected = sign(payload, secret);
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    try {
        const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { m: string; exp: number };
        if (data.exp < Math.floor(Date.now() / 1000)) return null;
        return await getMemberById(data.m);
    } catch {
        return null;
    }
}
