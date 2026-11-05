import { highlightParts } from "@/lib/search";

/** Shows the text with the words that match the search highlighted (also the approximate ones). */
export default function Highlight({ text, query }: { text: string; query?: string }) {
    if (!query?.trim()) return <>{text}</>;
    return (
        <>
            {highlightParts(text, query).map((p, i) =>
                p.hit ? <mark key={i} className="rounded bg-[#ffe27a] px-0.5 text-inherit">{p.text}</mark> : <span key={i}>{p.text}</span>
            )}
        </>
    );
}
