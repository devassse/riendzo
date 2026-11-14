import PageShell from "@/app/components/sections/page-shell";
import DonateForm from "@/app/components/donate/donate-form";

export const metadata = { title: "Doar · Riendzo" };

export default function Donate() {
    return (
        <PageShell title="Apoie a Riendzo" lead="A Riendzo é gratuita para quem quer descobrir Moçambique. A sua doação ajuda a manter e melhorar a plataforma.">
            <div className="mx-auto max-w-xl"><DonateForm /></div>
            <p className="mx-auto mt-6 max-w-xl text-center text-xs text-[#5b6478]">O pagamento é feito pelo M-Pesa: nunca vemos nem guardamos o seu PIN. As doações são voluntárias.</p>
        </PageShell>
    );
}
