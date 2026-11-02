import PageShell from "@/app/components/sections/page-shell";

export const metadata = { title: "Termos · Riendzo" };

const S: [string, string][] = [
    ["Utilização do site", "A Riendzo reúne informação sobre Moçambique para fins informativos. Procuramos que seja correta e atualizada, mas preços, horários, requisitos e taxas podem mudar: confirme sempre diretamente com a entidade."],
    ["Contas", "É responsável por manter a sua palavra-passe em segurança e pela atividade da sua conta. Podemos suspender contas usadas de forma abusiva."],
    ["Estabelecimentos e criadores", "Os restaurantes, alojamentos, guias, operadores e criadores são responsáveis pela exatidão da informação que publicam (preços, fotografias, horários, contactos). A Riendzo não é parte dos contratos entre visitantes e estabelecimentos."],
    ["Conteúdos e direitos de autor", "Música e vídeos só são reproduzidos quando cedidos pelos titulares ou quando são vídeos oficiais incorporados. Se for titular de direitos e quiser alterar ou retirar algum conteúdo, contacte-nos."],
    ["Alterações", "Podemos atualizar estes termos. A utilização continuada do site implica a aceitação da versão em vigor."],
];

export default function Terms() {
    return (
        <PageShell title="Termos de Utilização" lead="As regras de utilização da plataforma Riendzo.">
            <p className="mb-8 rounded-2xl bg-[#ffc14d]/25 p-4 text-sm text-[#6b4700]">Texto-modelo: deve ser revisto por um jurista antes do lançamento.</p>
            {S.map(([t, d]) => <section key={t} className="mb-7"><h2 className="font-baloo text-xl font-bold text-[#0b1220]">{t}</h2><p className="mt-1 leading-relaxed text-[#3c4658]">{d}</p></section>)}
        </PageShell>
    );
}
