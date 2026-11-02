"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function MediaUploader() {
    const router = useRouter();
    const ref = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [problems, setProblems] = useState<string[]>([]);

    async function upload(files: FileList | null) {
        if (!files?.length) return;
        setBusy(true);
        setProblems([]);
        const body = new FormData();
        Array.from(files).forEach((f) => body.append("file", f));
        try {
            const res = await fetch("/api/admin/upload", { method: "POST", body });
            const data = await res.json();
            setProblems(res.ok ? data.errors ?? [] : [data.error ?? "Falha no envio."]);
            router.refresh();
        } catch {
            setProblems(["Falha de ligação durante o envio."]);
        } finally {
            setBusy(false);
            if (ref.current) ref.current.value = "";
        }
    }

    return (
        <div className="rounded-3xl border border-dashed border-[#0b1220]/25 bg-white p-6 text-center">
            <input ref={ref} type="file" multiple hidden accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(e) => upload(e.target.files)} />
            <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="cursor-pointer rounded-full bg-[#0054b5] px-5 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
                {busy ? "A enviar…" : "⬆ Carregar imagens"}
            </button>
            <p className="mt-2 text-xs text-[#5b6478]">JPG, PNG, WebP, GIF ou AVIF · até 5 MB por imagem · até 10 de cada vez</p>
            {problems.map((p) => <p key={p} className="mt-1 text-xs font-medium text-[#d23b25]">{p}</p>)}
        </div>
    );
}
