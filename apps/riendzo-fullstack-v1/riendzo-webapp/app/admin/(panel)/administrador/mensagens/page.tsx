import { requireAdmin } from "@/lib/cms/auth";
import { listMessages } from "@/lib/cms/inbox";
import { deleteMessageAction, markMessageAction } from "../../../actions";

export default async function MessagesPage() {
    await requireAdmin(["admin"]);
    const msgs = await listMessages();
    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="font-baloo text-3xl font-bold">Mensagens</h1>
            <p className="mb-5 mt-1 text-sm text-[#4b5568]">Mensagens enviadas pelo formulário da página Contactos.</p>
            {msgs.length === 0 ? <p className="rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-10 text-center text-sm text-[#4b5568]">Sem mensagens.</p> : (
                <ul className="space-y-3">
                    {msgs.map((m) => (
                        <li key={m.id} className={`rounded-3xl border bg-white p-5 shadow-sm ${m.read ? "border-[#0b1220]/8" : "border-[#0054b5]/40"}`}>
                            <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-baloo font-medium">{!m.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#0054b5]" />}{m.name} <span className="text-sm font-normal text-[#5b6478]">· {m.contact}</span></p><span className="text-xs text-[#5b6478]">{new Date(m.at).toLocaleString("pt-PT")}</span></div>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-[#1b2433]">{m.message}</p>
                            <div className="mt-3 flex gap-4 text-xs">
                                <form action={markMessageAction}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="read" value={m.read ? "0" : "1"} /><button className="cursor-pointer text-[#0054b5] hover:underline">{m.read ? "Marcar como não lida" : "Marcar como lida"}</button></form>
                                <form action={deleteMessageAction}><input type="hidden" name="id" value={m.id} /><button className="cursor-pointer text-[#d23b25] hover:underline">Eliminar</button></form>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
