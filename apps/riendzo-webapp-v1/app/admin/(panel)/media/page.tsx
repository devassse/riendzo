import { listMedia } from "@/lib/cms/store";
import ConfirmButton from "../../_components/confirm-button";
import { deleteMediaAction } from "../../actions";
import MediaUploader from "./media-uploader";

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export default async function MediaPage() {
    const files = await listMedia();

    return (
        <div className="mx-auto max-w-6xl">
            <header className="mb-6">
                <h1 className="font-baloo text-3xl font-bold">Biblioteca de media</h1>
                <p className="mt-1 text-sm text-[#5b6478]">
                    Imagens carregadas no BackOffice. Copie o endereço e use-o em qualquer conteúdo, ou carregue diretamente no editor.
                </p>
            </header>

            <MediaUploader />

            {files.length === 0 ? (
                <p className="mt-6 rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-10 text-center text-sm text-[#5b6478]">
                    Ainda não há imagens carregadas.
                </p>
            ) : (
                <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {files.map((f) => (
                        <li key={f.url} className="overflow-hidden rounded-3xl border border-[#0b1220]/10 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={f.url} alt="" className="h-36 w-full object-cover" loading="lazy" />
                            <div className="p-3">
                                <p className="truncate text-xs font-medium">{f.name}</p>
                                <p className="text-[11px] text-[#5b6478]">{kb(f.size)}</p>
                                <input readOnly value={f.url} aria-label="Endereço da imagem" className="mt-2 w-full rounded-lg border border-[#0b1220]/10 bg-[#eef2f8] px-2 py-1 font-mono text-[10px]" />
                                <form action={deleteMediaAction} className="mt-2">
                                    <input type="hidden" name="url" value={f.url} />
                                    <ConfirmButton message="Eliminar esta imagem? Conteúdos que a usam ficarão sem fotografia." className="cursor-pointer text-[11px] font-medium text-[#d23b25] hover:underline">
                                        Eliminar
                                    </ConfirmButton>
                                </form>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
