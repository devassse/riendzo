import Link from "next/link";
import { requireAdmin } from "@/lib/cms/auth";
import { getCommsPublic } from "@/lib/cms/comms-settings";
import CommsSettings from "../../../_components/comms-settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Configurações | Riendzo BackOffice" };

export default async function SettingsPage() {
    await requireAdmin(["admin"]);
    return (
        <div className="mx-auto max-w-4xl">
            <nav className="mb-2 text-xs text-[#5b6478]"><Link href="/admin/administrador" className="hover:underline">Administrador</Link> / Configurações</nav>
            <h1 className="font-baloo text-3xl font-bold">Configurações de e-mail e SMS</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">Servem para a recuperação de palavra-passe e, mais tarde, para notificações. As chaves ficam guardadas cifradas no servidor e nunca voltam a ser mostradas.</p>
            <CommsSettings initial={await getCommsPublic()} />
        </div>
    );
}
