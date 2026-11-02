import SectionPage from "@/app/components/sections/section-page";

const SEASONS = [
    { emoji: "🦁", title: "Safári", when: "Maio a Outubro", text: "Época seca: os animais concentram-se junto à água e a vegetação é mais baixa.", color: "#35be12" },
    { emoji: "🐋", title: "Baleias-corcunda", when: "Julho a Outubro", text: "Passam ao largo de Inhambane e de Ponta do Ouro.", color: "#00aefb" },
    { emoji: "🦈", title: "Tubarão-baleia", when: "O ano todo, com pico no verão", text: "Tofo é um dos pontos mais conhecidos para os ver.", color: "#f0a83a" },
    { emoji: "🌀", title: "Época das chuvas", when: "Novembro a Abril", text: "Mais calor e humidade; estradas difíceis e risco de ciclones.", color: "#e5533d" },
];

export default async function Page() {
    return (
        <SectionPage section="tourism">
            <div className="mt-16">
                <h3 className="text-center font-baloo text-2xl font-bold text-[#0b1220]">
                    Quando viajar
                </h3>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {SEASONS.map((s) => (
                        <div key={s.title} className="rounded-3xl border border-[#0b1220]/10 p-5">
                            <span className="text-3xl" aria-hidden="true">{s.emoji}</span>
                            <h4 className="mt-3 font-baloo text-lg font-medium text-[#0b1220]">{s.title}</h4>
                            <p className="mt-1 text-[10px] font-montserrat-italic uppercase tracking-[0.18em]" style={{ color: s.color }}>
                                {s.when}
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{s.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </SectionPage>
    );
}
