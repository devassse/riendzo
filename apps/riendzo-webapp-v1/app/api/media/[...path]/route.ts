import { promises as fs } from "node:fs";
import path from "node:path";
import { UPLOADS_DIR } from "@/lib/cms/store";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
    jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif",
};

/** Serves the images uploaded in the BackOffice (they live outside /public). */
export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
    const parts = (await params).path;
    if (parts.length !== 2 || !/^\d{4}$/.test(parts[0]) || !/^[a-z0-9-]+\.(jpg|png|webp|gif|avif)$/.test(parts[1])) {
        return new Response("Not found", { status: 404 });
    }
    try {
        const file = await fs.readFile(path.join(UPLOADS_DIR, parts[0], parts[1]));
        return new Response(new Uint8Array(file), {
            headers: {
                "Content-Type": TYPES[parts[1].split(".").pop()!],
                // File names contain a random suffix, so they never change
                "Cache-Control": "public, max-age=31536000, immutable",
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch {
        return new Response("Not found", { status: 404 });
    }
}
