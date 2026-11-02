import { notFound } from "next/navigation";
import { requireAccessTo } from "@/lib/cms/auth";
import { getCollection } from "@/lib/cms/collections";
import { getItem, titleOf } from "@/lib/cms/store";
import { qrSvg } from "@/lib/cms/qr";
import PrintButton from "../../../_components/print-button";
import QrShare from "../../../_components/qr-share";

export const dynamic = "force-dynamic";
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://riendzo.co.mz").replace(/\/$/, "");

/** Printable QR card: put it on tables, doors or counters. It opens the establishment's public page. */
export default async function QrPage({ params }: { params: Promise<{ collection: string; slug: string }> }) {
    const { collection, slug } = await params;
    const session = await requireAccessTo(collection, slug);
    const back = session.role === "owner"
        ? { href: "/admin/meu-espaco", label: "← Voltar ao meu espaço" }
        : { href: `/admin/c/${collection}/${slug}`, label: "← Voltar ao conteúdo" };
    const def = getCollection(collection);
    const item = def?.directory ? await getItem(collection, slug) : undefined;
    if (!def || !item) notFound();
    const url = `${SITE}${def.publicPath}/${slug}`;

    return (
        <main className="mx-auto max-w-md px-4 py-10 print:py-0">
            <a href={back.href} className="mb-5 inline-flex items-center gap-1 rounded-full border border-[#0b1220]/15 bg-white px-4 py-2 text-sm font-medium text-[#0054b5] hover:bg-[#eef2f8] print:hidden">{back.label}</a>
            <div className="rounded-[2rem] border-2 border-[#0054b5] bg-white p-8 text-center shadow-sm print:shadow-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/riendzo-logo.png" alt="Riendzo" className="mx-auto w-44" />
                <h1 className="mt-6 font-baloo text-3xl font-bold leading-tight text-[#0b1220]">{titleOf(item)}</h1>
                <p className="mt-1 text-sm text-[#4b5568]">{def.label}</p>
                <div className="mx-auto mt-6 w-64 overflow-hidden rounded-2xl border border-[#0b1220]/10" dangerouslySetInnerHTML={{ __html: qrSvg(url, { dark: "#0b1220", margin: 3 }) }} role="img" aria-label={`QR Code: ${url}`} />
                <p className="mt-5 font-baloo text-lg font-medium text-[#0054b5]">Aponte a câmara do telemóvel</p>
                <p className="text-sm text-[#4b5568]">e veja {def.offers?.title ? def.offers.title.toLowerCase() : "a nossa página"}, horário e como chegar.</p>
                <p className="mt-4 break-all text-xs text-[#5b6478]">{url}</p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
                <PrintButton />
                <QrShare url={url} name={titleOf(item)} />
                <a href={`/api/qr/${collection}/${slug}?download=1`} className="rounded-full border border-[#0b1220]/20 px-5 py-2.5 text-sm font-medium hover:bg-[#0b1220]/5">Descarregar SVG</a>
            </div>
            <p className="mt-4 text-center text-xs text-[#5b6478] print:hidden">O QR Code aponta sempre para o endereço público desta página; se mudar o texto, o QR continua válido.</p>
        </main>
    );
}
