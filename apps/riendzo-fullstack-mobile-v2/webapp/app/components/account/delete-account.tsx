"use client";

import { useActionState, useState } from "react";
import { deleteAccountAction, type FormState } from "@/app/actions/member-actions";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#d23b25]";

/** "Eliminar a minha conta": closed by default, confirmed with the password and the word ELIMINAR. */
export default function DeleteAccount({ premiumUntil }: { premiumUntil?: string }) {
    const [state, action, pending] = useActionState<FormState, FormData>(deleteAccountAction, {});
    const [word, setWord] = useState("");
    const premium = premiumUntil && new Date(premiumUntil).getTime() > Date.now();

    return (
        <section className="mt-8 rounded-3xl border border-[#d23b25]/30 bg-white p-6 shadow-sm">
            <details>
                <summary className="cursor-pointer font-baloo text-lg font-bold text-[#b5311d]">Eliminar a minha conta</summary>
                <div className="mt-4 space-y-4 text-sm text-[#3c4658]">
                    <p>Apagamos o seu perfil, os favoritos, os locais e as fotografias. <b>É permanente.</b> Os pedidos já feitos ficam no histórico dos estabelecimentos, sem o seu nome nem telefone, e os registos de pagamentos mantêm-se sem o seu nome.</p>
                    {premium && <p className="rounded-xl bg-[#ffc14d]/25 px-3 py-2 text-[#6b4700]">⭐ Tem Premium ativo até {new Date(premiumUntil!).toLocaleDateString("pt-PT")}. Esse tempo perde-se e não é reembolsado.</p>}
                    <form action={action} className="space-y-3">
                        <label className="block text-xs font-medium">Palavra-passe
                            <input name="password" type="password" required autoComplete="current-password" className={input} />
                        </label>
                        <label className="block text-xs font-medium">Para confirmar, escreva ELIMINAR
                            <input name="confirm" value={word} onChange={(e) => setWord(e.target.value)} autoComplete="off" autoCapitalize="characters" className={input} />
                        </label>
                        {state.error && <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-xs text-[#b5311d]">{state.error}</p>}
                        <button type="submit" disabled={pending || word.trim().toUpperCase() !== "ELIMINAR"} className="cursor-pointer rounded-full bg-[#d23b25] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
                            {pending ? "A eliminar…" : "Eliminar a conta para sempre"}
                        </button>
                    </form>
                </div>
            </details>
        </section>
    );
}
