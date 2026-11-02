import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getMember } from "@/lib/members-auth";
import { UPLOADS_DIR } from "@/lib/cms/store";

export const runtime = "nodejs";
const MAX = 2 * 1024 * 1024;

function sniff(b: Buffer): "jpg" | "png" | "webp" | null {
    if (b.length < 12) return null;
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
    if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
    if (b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") return "webp";
    return null;
}

/** Profile photo of a logged-in member (JPG, PNG or WebP up to 2 MB). */
export async function POST(req: Request) {
    const member = await getMember();
    if (!member) return Response.json({ error: "Inicie sessão." }, { status: 401 });
    const origin = req.headers.get("origin"), host = req.headers.get("host");
    if (origin && host && new URL(origin).host !== host) return Response.json({ error: "Origem não permitida." }, { status: 403 });

    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) return Response.json({ error: "Nenhum ficheiro." }, { status: 400 });
    if (file.size > MAX) return Response.json({ error: "A imagem deve ter menos de 2 MB." }, { status: 400 });
    const buf = Buffer.from(await file.arrayBuffer());
    const ext = sniff(buf);
    if (!ext) return Response.json({ error: "Use JPG, PNG ou WebP." }, { status: 400 });

    const year = String(new Date().getFullYear());
    await fs.mkdir(path.join(UPLOADS_DIR, year), { recursive: true });
    const name = `avatar-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    await fs.writeFile(path.join(UPLOADS_DIR, year, name), buf);
    return Response.json({ url: `/api/media/${year}/${name}` });
}
