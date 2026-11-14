import { requireAdmin } from "@/lib/cms/auth";
import { listDonations, type DonationStatus } from "@/lib/donations";

export const dynamic = "force-dynamic";

const LABEL: Record<DonationStatus, [string, string]> = {
    paid: ["Pago", "bg-[#35be12]/15 text-[#238a0c]"],
    pending: ["A aguardar", "bg-[#ffc14d]/30 text-[#7a5200]"],
    failed: ["Falhou", "bg-[#d23b25]/12 text-[#b5311d]"],
    unknown: ["Por confirmar", "bg-[#0370d6]/12 text-[#0b4a99]"],
};

export default async function Donations() {
    await requireAdmin(["admin"]);
    const all = await listDonations();
    const paid = all.filter((d) => d.status === "paid" && !d.simulated);
    const total = paid.reduce((n, d) => n + d.amount, 0);
    const unknown = all.filter((d) => d.status === "unknown").length;
    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="font-baloo text-3xl font-bold">Doações</h1>
            <p className="mb-5 mt-1 text-sm text-[#4b5568]">{paid.length} doações pagas · <b>{total.toLocaleString("pt-PT")} MT</b> recebidos.{unknown > 0 && <> <b className="text-[#0b4a99]">{unknown} por confirmar</b>: confirme no extrato M-Pesa pela referência.</>}</p>
            <div className="overflow-x-auto rounded-3xl border border-[#0b1220]/8 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#f3f6fb] text-xs uppercase tracking-wide text-[#5b6478]"><tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Número</th><th className="px-4 py-3">Referência</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Detalhe</th></tr></thead>
                    <tbody>
                        {all.slice(0, 200).map((d) => (
                            <tr key={d.id} className="border-t border-[#0b1220]/8">
                                <td className="px-4 py-3">{new Date(d.createdAt).toLocaleString("pt-PT", { timeZone: "Africa/Maputo" })}</td>
                                <td className="px-4 py-3 font-medium">{d.amount.toLocaleString("pt-PT")} MT</td>
                                <td className="px-4 py-3">+{d.msisdn}</td>
                                <td className="px-4 py-3 font-mono text-xs">{d.ref}{d.transactionId ? ` · ${d.transactionId}` : ""}</td>
                                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs ${LABEL[d.status][1]}`}>{LABEL[d.status][0]}</span>{d.simulated && <span className="ml-1 text-[10px] text-[#8a5a00]">simulado</span>}</td>
                                <td className="px-4 py-3 text-xs text-[#4b5568]">{d.providerCode ? `${d.providerCode}: ` : ""}{d.providerDesc ?? ""}</td>
                            </tr>
                        ))}
                        {all.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-[#5b6478]">Ainda não há doações.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
