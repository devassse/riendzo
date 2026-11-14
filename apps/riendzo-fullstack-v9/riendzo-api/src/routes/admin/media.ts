import { Router } from "express";
import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import multer from "multer";
import { z } from "zod";
import { config } from "../../config";
import { prisma } from "../../db";
import { requireStaff } from "../../lib/auth";
import { ah, badRequest, notFound } from "../../lib/errors";
import { logActivity } from "../../services/activity";

export const adminMediaRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: config.maxUploadBytes, files: 1 } });

const IMAGE_MAX = 5 * 1024 * 1024;

/** The real type comes from the file's own bytes, never from the name or the Content-Type header. */
function sniff(b: Buffer): { ext: string; mime: string; image: boolean } | null {
    const at = (i: number, s: string) => b.subarray(i, i + s.length).toString("latin1") === s;
    if (b.length < 12) return null;
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg", image: true };
    if (b[0] === 0x89 && at(1, "PNG")) return { ext: "png", mime: "image/png", image: true };
    if (at(0, "GIF87a") || at(0, "GIF89a")) return { ext: "gif", mime: "image/gif", image: true };
    if (at(0, "RIFF") && at(8, "WEBP")) return { ext: "webp", mime: "image/webp", image: true };
    if (at(0, "RIFF") && at(8, "WAVE")) return { ext: "wav", mime: "audio/wav", image: false };
    if (at(4, "ftypavif") || at(4, "ftypavis")) return { ext: "avif", mime: "image/avif", image: true };
    if (at(4, "ftypM4A")) return { ext: "m4a", mime: "audio/mp4", image: false };
    if (at(0, "OggS")) return { ext: "ogg", mime: "audio/ogg", image: false };
    if (at(0, "ID3") || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)) return { ext: "mp3", mime: "audio/mpeg", image: false };
    return null;
}

const urlOf = (key: string) => `/api/media/${key}`;
const out = (m: { key: string; name: string; size: number; createdAt: Date }) => ({
    url: urlOf(m.key), name: m.key.split("/")[1], originalName: m.name, size: m.size, at: m.createdAt.toISOString(),
});

adminMediaRouter.get("/media", requireStaff(), ah(async (_req, res) => {
    const rows = await prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
    res.json({ data: rows.map(out) });
}));

adminMediaRouter.post("/media", requireStaff(), upload.single("file"), ah(async (req, res) => {
    const f = req.file;
    if (!f) throw badRequest("Envie um ficheiro no campo \"file\".");
    const kind = sniff(f.buffer);
    if (!kind) throw badRequest("Formato não suportado (JPG, PNG, WebP, GIF, AVIF, MP3, M4A, OGG ou WAV).");
    if (kind.image && f.size > IMAGE_MAX) throw badRequest("A imagem tem mais de 5 MB.");

    const year = String(new Date().getFullYear());
    const key = `${year}/${crypto.randomBytes(12).toString("hex")}.${kind.ext}`;
    const dest = path.join(config.uploadsDir, key);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, f.buffer, { flag: "wx" });

    const m = await prisma.media.create({
        data: { key, name: (f.originalname || "ficheiro").slice(0, 160), size: f.size, mime: kind.mime },
    });
    await logActivity(req.staff!, "Carregou ficheiro", undefined, m.name);
    res.status(201).json({ data: out(m) });
}));

adminMediaRouter.delete("/media", requireStaff("admin", "editor"), ah(async (req, res) => {
    const { url } = z.object({ url: z.string().max(200) }).parse(req.body);
    const mt = /^\/api\/media\/(\d{4}\/[a-f0-9]{24}\.(?:jpg|png|webp|gif|avif|mp3|m4a|ogg|wav))$/.exec(url);
    if (!mt) throw badRequest("Endereço inválido.");
    const r = await prisma.media.deleteMany({ where: { key: mt[1] } });
    if (!r.count) throw notFound("Ficheiro não encontrado.");
    await fs.rm(path.join(config.uploadsDir, mt[1]), { force: true });
    res.status(204).end();
}));
