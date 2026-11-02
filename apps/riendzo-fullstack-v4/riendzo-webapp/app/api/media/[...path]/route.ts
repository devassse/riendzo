import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { UPLOADS_DIR } from "@/lib/cms/store";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
    jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif",
    mp3: "audio/mpeg", m4a: "audio/mp4", ogg: "audio/ogg", wav: "audio/wav",
    mp4: "video/mp4", webm: "video/webm",
};

const body = (file: string, start?: number, end?: number) => Readable.toWeb(createReadStream(file, start === undefined ? undefined : { start, end })) as unknown as ReadableStream;

/** Serves the files uploaded in the BackOffice (they live outside /public). Supports Range requests so audio and video can be sought. */
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
    const parts = (await params).path;
    if (parts.length !== 2 || !/^\d{4}$/.test(parts[0]) || !/^[a-z0-9-]+\.(jpg|png|webp|gif|avif|mp3|m4a|ogg|wav|mp4|webm)$/.test(parts[1])) {
        return new Response("Not found", { status: 404 });
    }
    const file = path.join(UPLOADS_DIR, parts[0], parts[1]);
    let size: number;
    try {
        size = (await fs.stat(file)).size;
    } catch {
        return new Response("Not found", { status: 404 });
    }
    const headers: Record<string, string> = {
        "Content-Type": TYPES[parts[1].split(".").pop()!],
        "Accept-Ranges": "bytes",
        // File names contain a random suffix, so they never change
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
    };

    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
    if (range && (range[1] || range[2])) {
        let start = range[1] ? Number(range[1]) : size - Number(range[2]);
        let end = range[1] && range[2] ? Number(range[2]) : size - 1;
        start = Math.max(0, start);
        end = Math.min(size - 1, end);
        if (start > end || start >= size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
        return new Response(body(file, start, end), {
            status: 206,
            headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
        });
    }
    return new Response(body(file), { headers: { ...headers, "Content-Length": String(size) } });
}
