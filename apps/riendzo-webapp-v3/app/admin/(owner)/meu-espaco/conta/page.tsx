import PasswordForm from "../../../_components/password-form";

export default function Account() {
    return (
        <div className="max-w-md">
            <h1 className="font-baloo text-3xl font-bold">A minha conta</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">Altere a palavra-passe de acesso ao seu portal.</p>
            <PasswordForm />
        </div>
    );
}
