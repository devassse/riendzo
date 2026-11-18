import PageShell from "@/app/components/sections/page-shell";

export const metadata = { title: "Privacidade · Riendzo" };

const S: [string, string][] = [
    ["Que dados recolhemos", "Quando cria uma conta Riendzo AI guardamos o nome, o apelido, o e-mail ou telefone, a palavra-passe (sempre cifrada), e os dados que decidir acrescentar ao perfil (fotografia, província, interesses, favoritos). Quando nos escreve pelo formulário de contactos guardamos o seu nome, contacto e mensagem. Estabelecimentos registados fornecem os dados da sua página."],
    ["Para que usamos", "Para gerir a sua conta, mostrar os seus favoritos, sugerir conteúdos relevantes e responder às suas mensagens. Não vendemos os seus dados."],
    ["Cookies", "Usamos apenas cookies essenciais: o da sessão (para se manter autenticado) e o da língua escolhida. Alguns conteúdos incorporados, como vídeos do YouTube, só são carregados quando carrega em reproduzir e usam o modo de privacidade reforçada."],
    ["Pedidos e reservas", "Quando faz um pedido ou uma reserva guardamos o que pediu, as datas e o telefone de contacto, e partilhamos esses dados com o estabelecimento para ele o atender. O pagamento da comida ou do alojamento é feito diretamente ao estabelecimento."],
    ["Pagamentos e doações", "As subscrições Premium e as doações são pagas por M-Pesa. Guardamos o valor, a data, a referência e o número que foi debitado para podermos confirmar o pagamento. Nunca vemos nem guardamos o seu PIN. Estes registos mantêm-se para efeitos de contabilidade, mesmo depois de eliminar a conta, sem o seu nome."],
    ["Locais que guarda", "Os locais que guarda em “Os meus locais” são só seus, incluindo as notas privadas. Se sugerir um local à equipa, passamos a ver o nome, a descrição, a localização, o contacto e as fotografias que indicou, para o rever e, se aprovado, publicar. A localização do telemóvel só é pedida quando carrega em “Usar a minha localização” e não é guardada de forma contínua."],
    ["Verificação da conta", "Para confirmar a conta enviamos um código por e-mail ou SMS para o contacto que indicou."],
    ["Os seus direitos", "Pode ver e corrigir os seus dados em “O meu perfil”. Pode também eliminar a conta quando quiser, em “O meu perfil → Eliminar a minha conta”: apagamos o perfil, os favoritos, os locais e as fotografias. Veja como em /eliminar-conta."],
    ["Segurança", "As palavras-passe são guardadas com cifragem e as sessões expiram automaticamente."],
];

export default function Privacy() {
    return (
        <PageShell title="Política de Privacidade" lead="Como tratamos os seus dados.">
            {S.map(([t, d]) => <section key={t} className="mb-7"><h2 className="font-baloo text-xl font-bold text-[#0b1220]">{t}</h2><p className="mt-1 leading-relaxed text-[#3c4658]">{d}</p></section>)}
        </PageShell>
    );
}
