import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getSession } from "@/lib/cms/auth";
import { UPLOADS_DIR } from "@/lib/cms/store";
import { slugify } from "@/lib/cms/validate";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 10;

/** Detects the real image type from the first bytes (the file name / MIME can be faked). */
function sniff(buf: Buffer): "jpg" | "png" | "webp" | "gif" | "avif" | null {
    if (buf.length < 12) return null;
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
    if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
    if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
    if (buf.subarray(0, 4).toString() === "GIF8") return "gif";
    if (buf.subarray(4, 8).toString() === "ftyp" && buf.subarray(8, 12).toString().startsWith("avi")) return "avif";
    return null;
}

export async function POST(req: Request) {
    if (!(await getSession())) return Response.json({ error: "Sessão expirada." }, { status: 401 });

    // Same-origin only (extra CSRF protection on top of the SameSite cookie)
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host && new URL(origin).host !== host) {
        return Response.json({ error: "Origem não permitida." }, { status: 403 });
    }

    const form = await req.formData();
    const files = form.getAll("file").filter((f): f is File => f instanceof File).slice(0, MAX_FILES);
    if (!files.length) return Response.json({ error: "Nenhum ficheiro enviado." }, { status: 400 });

    const year = String(new Date().getFullYear());
    const dir = path.join(UPLOADS_DIR, year);
    await fs.mkdir(dir, { recursive: true });

    const uploaded: { url: string; name: string }[] = [];
    const errors: string[] = [];

    for (const file of files) {
        if (file.size > MAX_BYTES) { errors.push(`${file.name}: maior que 5 MB.`); continue; }
        const buf = Buffer.from(await file.arrayBuffer());
        const ext = sniff(buf);
        if (!ext) { errors.push(`${file.name}: formato não suportado (use JPG, PNG, WebP, GIF ou AVIF).`); continue; }

        const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "imagem";
        const name = `${base}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
        await fs.writeFile(path.join(dir, name), buf);
        uploaded.push({ url: `/api/media/${year}/${name}`, name });
    }

    return Response.json({ files: uploaded, errors });
}
