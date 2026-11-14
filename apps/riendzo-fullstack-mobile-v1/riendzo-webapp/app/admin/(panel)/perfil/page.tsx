import { requireAdmin } from "@/lib/cms/auth";
import PasswordForm from "../../_components/password-form";
import ProfileEditor from "../../_components/profile-editor";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const s = await requireAdmin();
    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="font-baloo text-3xl font-bold">O meu perfil</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">A sua fotografia, os seus contactos e o acesso à conta.</p>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
                <ProfileEditor user={{ username: s.user, name: s.name, role: s.role, avatar: s.avatar, email: s.email, phone: s.phone }} />
                <div>
                    <h2 className="mb-3 font-baloo text-lg font-bold">Palavra-passe</h2>
                    {s.userId === "env"
                        ? <p className="rounded-3xl border border-[#0b1220]/8 bg-white p-6 text-sm text-[#4b5568] shadow-sm">A palavra-passe desta conta principal é definida no servidor (<code>ADMIN_PASSWORD</code>).</p>
                        : <PasswordForm />}
                </div>
            </div>
        </div>
    );
}
