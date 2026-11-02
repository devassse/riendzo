import { getCollection } from "@/lib/cms/collections";
import { getItem } from "@/lib/cms/store";
import { qrSvg } from "@/lib/cms/qr";

export const runtime = "nodejs";
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://riendzo.co.mz").replace(/\/$/, "");

/** QR Code (SVG) that opens the public page of an establishment. ?download=1 forces a download. */
export async function GET(req: Request, { params }: { params: Promise<{ collection: string; slug: string }> }) {
    const { collection, slug } = await params;
    const def = getCollection(collection);
    if (!def?.directory || !/^[a-z0-9-]{1,100}$/.test(slug) || !(await getItem(collection, slug))) {
        return new Response("Not found", { status: 404 });
    }
    const svg = qrSvg(`${SITE}${def.publicPath}/${slug}`, { dark: "#0b1220" });
    const download = new URL(req.url).searchParams.get("download");
    return new Response(svg, {
        headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=3600",
            ...(download ? { "Content-Disposition": `attachment; filename="qr-${slug}.svg"` } : {}),
        },
    });
}
