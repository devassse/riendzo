import PageShell from "@/app/components/sections/page-shell";
import ContactForm from "@/app/components/sections/contact-form";

export const metadata = { title: "Contactos · Riendzo" };
const EMAIL = process.env.CONTACT_EMAIL ?? "";

export default function Contacts() {
    return (
        <PageShell title="Contactos" lead="Sugestões, correções ou quer registar o seu estabelecimento? Escreva-nos.">
            <ContactForm />
            {EMAIL && <p className="mt-8 text-center text-sm text-[#5b6478]">Ou envie um e-mail para <a href={`mailto:${EMAIL}`} className="font-medium text-[#0054b5] underline">{EMAIL}</a></p>}
            <p className="mt-6 text-center text-sm text-[#5b6478]">Restaurantes, hotéis, guias, operadores e rent-a-car: peça o registo e receba um acesso para gerir a sua própria página.</p>
        </PageShell>
    );
}
