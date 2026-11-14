import { Link } from "@/i18n/navigation";
import PageShell from "@/app/components/sections/page-shell";

export const metadata = { title: "Eliminar conta · Riendzo" };

const EMAIL = process.env.CONTACT_EMAIL ?? "";

/** Public page: how to delete the account and what happens to the data (also the "delete account" URL the app stores ask for). */
export default function DeleteAccount() {
    return (
        <PageShell title="Eliminar a conta" lead="Pode eliminar a sua conta Riendzo quando quiser.">
            <div className="mx-auto max-w-2xl space-y-8 text-[#3c4658]">
                <section>
                    <h2 className="font-baloo text-xl font-bold text-[#0b1220]">Como eliminar</h2>
                    <ol className="mt-2 list-decimal space-y-1.5 pl-5">
                        <li><Link href="/conta/entrar?next=%2Fconta%2Fperfil" className="font-medium text-[#0054b5] underline">Entre na sua conta</Link> (na app ou no site).</li>
                        <li>Abra <b>O meu perfil</b> e vá até ao fim da página.</li>
                        <li>Em <b>Eliminar a minha conta</b>, escreva a palavra-passe e a palavra <b>ELIMINAR</b> e confirme.</li>
                    </ol>
                    <p className="mt-3 text-sm">Se já não consegue entrar, escreva-nos pelos <Link href="/contactos" className="font-medium text-[#0054b5] underline">contactos</Link>{EMAIL ? <> ou para <b>{EMAIL}</b></> : null}, a partir do e-mail ou telefone da conta, e eliminamos por si.</p>
                </section>

                <section>
                    <h2 className="font-baloo text-xl font-bold text-[#0b1220]">O que é apagado</h2>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>O perfil: nome, contactos, fotografia, interesses e favoritos.</li>
                        <li>Os locais que guardou (incluindo as notas privadas e as fotografias).</li>
                        <li>Os códigos de verificação pendentes e a sessão aberta.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-baloo text-xl font-bold text-[#0b1220]">O que se mantém</h2>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>O histórico de pedidos dos estabelecimentos, <b>sem</b> o seu nome nem telefone.</li>
                        <li>Os registos de pagamentos (Premium e doações), por obrigações de contabilidade, <b>sem</b> o seu nome.</li>
                        <li>Os locais que a equipa já publicou: passam a fazer parte do conteúdo da Riendzo e não ficam ligados a si.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-baloo text-xl font-bold text-[#0b1220]">Antes de eliminar</h2>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>Não é possível eliminar com pedidos em curso: aguarde que terminem ou cancele-os.</li>
                        <li>O tempo de Premium que ainda tiver perde-se e não é reembolsado.</li>
                        <li>A eliminação é permanente e não pode ser desfeita.</li>
                    </ul>
                </section>
            </div>
        </PageShell>
    );
}
