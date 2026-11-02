"use client";

import { useEffect, useRef, useState } from "react";
import { youtubeId } from "@/lib/cms/sanitize";

const btn = "cursor-pointer rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#0b1220] transition-colors hover:bg-[#eef2f8] disabled:opacity-40";

/**
 * WYSIWYG editor (no dependencies): headings, bold/italic/underline, lists, quotes,
 * links, images (upload or address) and YouTube videos inside the text.
 * The HTML it produces is sanitised again on the server before being saved.
 */
export default function RichEditor({ value, onChange, placeholder = "Escreva aqui…", minHeight = "14rem" }: { value: string; onChange: (html: string) => void; placeholder?: string; minHeight?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const saved = useRef<Range | null>(null);
    const [source, setSource] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    // Load the initial HTML once (afterwards the DOM is the source of truth)
    useEffect(() => {
        if (ref.current) ref.current.innerHTML = value;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const emit = () => ref.current && onChange(ref.current.innerHTML);
    const remember = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode)) saved.current = sel.getRangeAt(0).cloneRange();
    };
    const restore = () => {
        ref.current?.focus();
        const sel = window.getSelection();
        if (saved.current && sel) { sel.removeAllRanges(); sel.addRange(saved.current); }
    };
    const run = (cmd: string, arg?: string) => {
        restore();
        document.execCommand(cmd, false, arg);
        emit();
    };

    function addLink() {
        remember();
        const url = window.prompt("Endereço do link (https://…):");
        if (!url) return;
        if (!/^(https?:\/\/|mailto:|tel:|\/)/i.test(url.trim())) { setError("O link deve começar por https://, mailto:, tel: ou /."); return; }
        setError("");
        run("createLink", url.trim());
    }

    function addYoutube() {
        remember();
        const url = window.prompt("Link do vídeo do YouTube:");
        if (!url) return;
        const id = youtubeId(url);
        if (!id) { setError("Link do YouTube inválido."); return; }
        setError("");
        run("insertHTML", `<p><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Vídeo"></iframe></p><p><br></p>`);
    }

    function addImageUrl() {
        remember();
        const src = window.prompt("Endereço da imagem (https://… ou /api/media/…):");
        if (!src) return;
        insertImage(src.trim());
    }

    function insertImage(src: string) {
        if (!/^(https:\/\/|\/(?!\/))/.test(src)) { setError("O endereço da imagem deve começar por https:// ou /."); return; }
        const alt = (window.prompt("Descrição da imagem (para acessibilidade):") ?? "").replace(/[<>"]/g, "");
        setError("");
        run("insertHTML", `<figure><img src="${src}" alt="${alt}">${alt ? `<figcaption>${alt}</figcaption>` : ""}</figure><p><br></p>`);
    }

    async function upload(files: FileList | null) {
        if (!files?.length) return;
        setBusy(true); setError("");
        const body = new FormData();
        body.append("file", files[0]);
        try {
            const r = await fetch("/api/admin/upload", { method: "POST", body });
            const d = await r.json();
            if (!r.ok || !d.files?.[0]) setError(d.errors?.[0] ?? d.error ?? "Falha no envio.");
            else insertImage(d.files[0].url);
        } catch { setError("Falha de ligação."); } finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
    }

    const B = ({ label, title, onClick }: { label: React.ReactNode; title: string; onClick: () => void }) => (
        <button type="button" title={title} aria-label={title} className={btn} onMouseDown={(e) => e.preventDefault()} onClick={onClick}>{label}</button>
    );

    return (
        <div className="overflow-hidden rounded-2xl border border-[#0b1220]/15 bg-white focus-within:border-[#0370d6]">
            <div className="flex flex-wrap items-center gap-0.5 border-b border-[#0b1220]/10 bg-[#f8f9fc] px-2 py-1.5" role="toolbar" aria-label="Formatação">
                <B title="Parágrafo" label="¶" onClick={() => run("formatBlock", "p")} />
                <B title="Título" label={<b>H2</b>} onClick={() => run("formatBlock", "h2")} />
                <B title="Subtítulo" label={<b>H3</b>} onClick={() => run("formatBlock", "h3")} />
                <span className="mx-1 h-5 w-px bg-[#0b1220]/15" />
                <B title="Negrito" label={<b>B</b>} onClick={() => run("bold")} />
                <B title="Itálico" label={<i>I</i>} onClick={() => run("italic")} />
                <B title="Sublinhado" label={<u>U</u>} onClick={() => run("underline")} />
                <span className="mx-1 h-5 w-px bg-[#0b1220]/15" />
                <B title="Lista de pontos" label="• ―" onClick={() => run("insertUnorderedList")} />
                <B title="Lista numerada" label="1." onClick={() => run("insertOrderedList")} />
                <B title="Citação" label="❝" onClick={() => run("formatBlock", "blockquote")} />
                <span className="mx-1 h-5 w-px bg-[#0b1220]/15" />
                <B title="Inserir link" label="🔗" onClick={addLink} />
                <B title="Remover link" label="⛓️‍💥" onClick={() => run("unlink")} />
                <B title="Carregar imagem" label={busy ? "…" : "🖼️⬆"} onClick={() => { remember(); fileRef.current?.click(); }} />
                <B title="Imagem por endereço" label="🖼️" onClick={addImageUrl} />
                <B title="Vídeo do YouTube" label="▶️" onClick={addYoutube} />
                <B title="Linha separadora" label="―" onClick={() => run("insertHorizontalRule")} />
                <span className="mx-1 h-5 w-px bg-[#0b1220]/15" />
                <B title="Limpar formatação" label="Tx" onClick={() => run("removeFormat")} />
                <B title="Desfazer" label="↶" onClick={() => run("undo")} />
                <B title="Refazer" label="↷" onClick={() => run("redo")} />
                <button type="button" className={`${btn} ml-auto ${source ? "bg-[#0054b5] text-white hover:bg-[#0054b5]" : ""}`} onClick={() => { if (source && ref.current) ref.current.innerHTML = value; setSource(!source); }}>{"</>"} HTML</button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden onChange={(e) => upload(e.target.files)} />
            </div>

            {source && (
                <textarea value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} className="block w-full resize-y bg-[#0b1220] p-4 font-mono text-xs text-[#d9dfec] outline-none" style={{ minHeight }} aria-label="Código HTML" />
            )}
            <div
                ref={ref} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label="Texto"
                data-placeholder={placeholder}
                onInput={emit} onBlur={() => { remember(); emit(); }} onKeyUp={remember} onMouseUp={remember}
                onPaste={(e) => { e.preventDefault(); document.execCommand("insertText", false, e.clipboardData.getData("text/plain")); emit(); }}
                className={`rich p-4 outline-none empty:before:text-[#8892a6] empty:before:content-[attr(data-placeholder)] ${source ? "hidden" : ""}`}
                style={{ minHeight }}
            />
            {error && <p role="alert" className="border-t border-[#0b1220]/10 bg-[#e5533d]/8 px-4 py-2 text-xs font-medium text-[#b5311d]">{error}</p>}
        </div>
    );
}
