import { ImageResponse } from "next/og";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import { brandGradient } from "@/lib/color";
import { getCollection } from "@/lib/cms/collections";
import { getItem } from "@/lib/cms/store";

export const runtime = "nodejs";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** The logo as a data URL (the renderer needs the bytes); PNG and JPEG only, anything else is skipped. */
async function logoData(src?: string) {
    if (!src) return null;
    try {
        const res = await fetch(src.startsWith("/") ? `${SITE}${src}` : src, { signal: AbortSignal.timeout(3000) });
        const type = res.headers.get("content-type") ?? "";
        if (!res.ok || !/image\/(png|jpeg)/.test(type)) return null;
        return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
    } catch {
        return null;
    }
}

/**
 * Share image (1200×630) of an establishment, in the colour of its brand:
 * what WhatsApp, Facebook and others show when the link is shared.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ collection: string; slug: string }> }) {
    const { collection, slug } = await params;
    const def = getCollection(collection);
    const item = (await getItem(collection, slug)) as CatalogItem | undefined;
    if (!def || def.kind !== "catalog" || !item || item.status === "draft") return new Response("Not found", { status: 404 });

    const { from, to } = brandGradient(item.color ?? def.color);
    const logo = await logoData(item.logo);
    const size = item.title.length > 46 ? 58 : item.title.length > 28 ? 70 : 84;

    return new ImageResponse(
        (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, color: "#fff", background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}>
                <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 14, background: item.color }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, textTransform: "uppercase", opacity: 0.85 }}>{def.label}</div>
                    {logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logo} width={150} height={150} alt="" style={{ objectFit: "contain", background: "#fff", borderRadius: 32, padding: 18 }} />
                    )}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", fontSize: size, fontWeight: 800, lineHeight: 1.05 }}>{item.title}</div>
                    {item.tag && <div style={{ display: "flex", marginTop: 22, fontSize: 34, opacity: 0.85 }}>{item.tag}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 30 }}>
                    <div style={{ display: "flex", fontWeight: 700 }}>Riendzo · Assistente de Viagens</div>
                    <div style={{ display: "flex", opacity: 0.8 }}>riendzo.co.mz</div>
                </div>
            </div>
        ),
        { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" } }
    );
}
