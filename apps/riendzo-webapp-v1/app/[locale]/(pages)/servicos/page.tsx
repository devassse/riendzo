import SectionPage from "@/app/components/sections/section-page";

const NUMBERS = [
    { n: "117", label: "Ambulância", color: "#e5533d" },
    { n: "119", label: "Polícia", color: "#00aefb" },
    { n: "197", label: "Bombeiros", color: "#f0a83a" },
    { n: "116", label: "Linha Fala Criança", color: "#c86b8c" },
];

export default async function Page() {
    return (
        <SectionPage section="services">
            <div className="mt-16">
                <h3 className="text-center font-baloo text-2xl font-bold text-[#0b1220]">
                    Números úteis
                </h3>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {NUMBERS.map((x) => (
                        <div key={x.n} className="rounded-3xl border border-[#0b1220]/10 p-5 text-center">
                            <p className="font-baloo text-4xl font-bold" style={{ color: x.color }}>{x.n}</p>
                            <p className="mt-1 text-sm text-[#5b6478]">{x.label}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-center text-xs text-[#5b6478]">
                    Os números podem variar por zona ou operadora. Confirme-os nos canais oficiais.
                </p>
            </div>
        </SectionPage>
    );
}
