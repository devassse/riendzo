import { Link } from "@/i18n/navigation";
import PageShell from "@/app/components/sections/page-shell";

export const metadata = { title: "Sobre · Riendzo" };

const PILLARS = [
    ["📜", "História", "Povos, reinos, a colonização, a independência e a paz, contados com rigor."],
    ["🎵", "Música", "Artistas, discografias e álbuns de fotografias para ouvir e descobrir."],
    ["🍲", "Gastronomia", "Receitas, restaurantes com menu e preços, e os criadores que as partilham."],
    ["🌴", "Turismo", "Praias, parques, alojamentos, guias, transportes e roteiros."],
    ["🏛️", "Serviços públicos", "Documentos, saúde, bancos, escolas, emergências e muito mais."],
    ["🎬", "Entretenimento & Blog", "Cinema, eventos, desporto, notícias explicadas e opinião."],
];

export default function About() {
    return (
        <PageShell title="Sobre a Riendzo" lead="O assistente de viagens que reúne Moçambique num só lugar." wide>
            <div className="mx-auto max-w-3xl text-lg leading-relaxed text-[#3c4658]">
                <p>A Riendzo nasceu para que viajantes, estudantes, famílias e curiosos encontrem, num único sítio, tudo o que precisam de saber sobre Moçambique: onde ir, o que comer, o que ouvir, como resolver um documento e a quem pedir ajuda.</p>
                <p className="mt-4">Damos palco a quem faz o país: restaurantes, hotéis e guesthouses, guias, operadores, artistas e criadores de conteúdo nacionais, que têm a sua própria página e gerem o seu conteúdo.</p>
            </div>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PILLARS.map(([e, t, d]) => (
                    <li key={t} className="rounded-3xl border border-[#0b1220]/10 p-6"><span className="text-3xl" aria-hidden="true">{e}</span><h2 className="mt-3 font-baloo text-xl font-medium">{t}</h2><p className="mt-1 text-sm text-[#5b6478]">{d}</p></li>
                ))}
            </ul>
            <p className="mt-12 text-center"><Link href="/contactos" className="rounded-full bg-[#0054b5] px-6 py-3 font-baloo font-medium text-white hover:opacity-90">Fale connosco</Link></p>
        </PageShell>
    );
}
