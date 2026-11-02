"use client";

import { useActionState, useState } from "react";
import PasswordInput from "@/app/components/utils/password-input";
import { saveCommsSettingsAction, testEmailAction, testSmsAction, type FormState } from "../actions";

type Initial = Awaited<ReturnType<typeof import("@/lib/cms/comms-settings").getCommsPublic>>;

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0370d6]";
const card = "rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm";
const Msg = ({ s }: { s: FormState }) => s.error ? <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-sm text-[#b5311d]">{s.error}</p> : s.ok ? <p role="status" className="rounded-xl bg-[#2f9e44]/12 px-3 py-2 text-sm text-[#237a35]">{s.ok}</p> : null;
const Stored = () => <span className="ml-2 rounded-full bg-[#2f9e44]/15 px-2 py-0.5 text-[10px] font-medium text-[#237a35]">✓ guardada</span>;

export default function CommsSettings({ initial }: { initial: Initial }) {
    const [s, save, saving] = useActionState<FormState, FormData>(saveCommsSettingsAction, {});
    const [mail, testMail, testingMail] = useActionState<FormState, FormData>(testEmailAction, {});
    const [sms, testSms, testingSms] = useActionState<FormState, FormData>(testSmsAction, {});
    const [provider, setProvider] = useState(initial.sms.provider);

    return (
        <div className="space-y-6">
            <form action={save} className="space-y-6">
                <section className={card}>
                    <h2 className="font-baloo text-xl font-bold">✉️ E-mail <span className="text-xs font-normal text-[#5b6478]">via Resend (resend.com)</span></h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="block text-xs font-medium">Chave da API{initial.email.hasKey && <Stored />}
                            <PasswordInput name="emailApiKey" autoComplete="off" placeholder={initial.email.hasKey ? "Deixe vazio para manter" : "re_…"} className={input} />
                        </label>
                        <label className="block text-xs font-medium">Remetente
                            <input name="emailFrom" defaultValue={initial.email.from} placeholder="Riendzo <no-reply@riendzo.co.mz>" className={input} />
                        </label>
                    </div>
                    <p className="mt-2 text-[11px] text-[#5b6478]">O domínio do remetente tem de estar verificado no Resend.</p>
                </section>

                <section className={card}>
                    <h2 className="font-baloo text-xl font-bold">💬 SMS</h2>
                    <label className="mt-4 block text-xs font-medium">Serviço
                        <select name="smsProvider" value={provider} onChange={(e) => setProvider(e.target.value as typeof provider)} className={input}>
                            <option value="none">Desligado</option>
                            <option value="twilio">Twilio</option>
                            <option value="africastalking">Africa’s Talking</option>
                        </select>
                    </label>

                    {provider === "twilio" && (
                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            <label className="block text-xs font-medium">Account SID<input name="twilioSid" defaultValue={initial.sms.twilioSid} autoComplete="off" placeholder="AC…" className={input} /></label>
                            <label className="block text-xs font-medium">Auth Token{initial.sms.hasTwilioToken && <Stored />}<PasswordInput name="twilioToken" autoComplete="off" placeholder={initial.sms.hasTwilioToken ? "Deixe vazio para manter" : ""} className={input} /></label>
                            <label className="block text-xs font-medium">Número ou Messaging Service<input name="twilioFrom" defaultValue={initial.sms.twilioFrom} placeholder="+1… ou MG…" className={input} /></label>
                        </div>
                    )}
                    {provider === "africastalking" && (
                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            <label className="block text-xs font-medium">Utilizador (username)<input name="atUsername" defaultValue={initial.sms.atUsername} autoComplete="off" placeholder="sandbox" className={input} /></label>
                            <label className="block text-xs font-medium">Chave da API{initial.sms.hasAtKey && <Stored />}<PasswordInput name="atApiKey" autoComplete="off" placeholder={initial.sms.hasAtKey ? "Deixe vazio para manter" : ""} className={input} /></label>
                            <label className="block text-xs font-medium">Nome do remetente (opcional)<input name="atSender" defaultValue={initial.sms.atSender} placeholder="Riendzo" className={input} /></label>
                        </div>
                    )}
                    {provider === "none" && <p className="mt-3 text-sm text-[#5b6478]">Com o SMS desligado, quem se registou só com telefone tem de contactar o administrador para recuperar a conta.</p>}
                </section>

                <div className="flex flex-wrap items-center gap-3">
                    <button disabled={saving} className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">{saving ? "A guardar…" : "Guardar configurações"}</button>
                    <Msg s={s} />
                </div>
            </form>

            <div className="grid gap-6 md:grid-cols-2">
                <form action={testMail} className={card}>
                    <h3 className="font-baloo text-lg font-bold">Enviar e-mail de teste</h3>
                    <p className="text-xs text-[#5b6478]">Guarde primeiro as configurações.</p>
                    <label className="mt-3 block text-xs font-medium">Para<input name="to" type="email" required placeholder="nome@exemplo.com" className={input} /></label>
                    <div className="mt-3 space-y-2"><button disabled={testingMail} className="cursor-pointer rounded-full border border-[#0054b5] px-5 py-2 text-sm font-medium text-[#0054b5] hover:bg-[#0054b5]/5 disabled:opacity-60">{testingMail ? "A enviar…" : "Enviar teste"}</button><Msg s={mail} /></div>
                </form>
                <form action={testSms} className={card}>
                    <h3 className="font-baloo text-lg font-bold">Enviar SMS de teste</h3>
                    <p className="text-xs text-[#5b6478]">Guarde primeiro as configurações.</p>
                    <label className="mt-3 block text-xs font-medium">Para<input name="to" type="tel" required placeholder="84 123 4567" className={input} /></label>
                    <div className="mt-3 space-y-2"><button disabled={testingSms} className="cursor-pointer rounded-full border border-[#0054b5] px-5 py-2 text-sm font-medium text-[#0054b5] hover:bg-[#0054b5]/5 disabled:opacity-60">{testingSms ? "A enviar…" : "Enviar teste"}</button><Msg s={sms} /></div>
                </form>
            </div>
        </div>
    );
}
