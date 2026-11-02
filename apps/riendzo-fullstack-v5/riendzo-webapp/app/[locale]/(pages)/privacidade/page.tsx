import PageShell from "@/app/components/sections/page-shell";

export const metadata = { title: "Privacidade · Riendzo" };

const S: [string, string][] = [
    ["Que dados recolhemos", "Quando cria uma conta Riendzo AI guardamos o nome, o apelido, o e-mail ou telefone, a palavra-passe (sempre cifrada), e os dados que decidir acrescentar ao perfil (fotografia, província, interesses, favoritos). Quando nos escreve pelo formulário de contactos guardamos o seu nome, contacto e mensagem. Estabelecimentos registados fornecem os dados da sua página."],
    ["Para que usamos", "Para gerir a sua conta, mostrar os seus favoritos, sugerir conteúdos relevantes e responder às suas mensagens. Não vendemos os seus dados."],
    ["Cookies", "Usamos apenas cookies essenciais: o da sessão (para se manter autenticado) e o da língua escolhida. Alguns conteúdos incorporados, como vídeos do YouTube, só são carregados quando carrega em reproduzir e usam o modo de privacidade reforçada."],
    ["Os seus direitos", "Pode ver e corrigir os seus dados em “O meu perfil” e pedir a eliminação da conta através dos contactos do site."],
    ["Segurança", "As palavras-passe são guardadas com cifragem e as sessões expiram automaticamente."],
];

export default function Privacy() {
    return (
        <PageShell title="Política de Privacidade" lead="Como tratamos os seus dados.">
            <p className="mb-8 rounded-2xl bg-[#ffc14d]/25 p-4 text-sm text-[#6b4700]">Texto-modelo: deve ser revisto por um jurista antes do lançamento, de acordo com a legislação aplicável.</p>
            {S.map(([t, d]) => <section key={t} className="mb-7"><h2 className="font-baloo text-xl font-bold text-[#0b1220]">{t}</h2><p className="mt-1 leading-relaxed text-[#3c4658]">{d}</p></section>)}
        </PageShell>
    );
}
