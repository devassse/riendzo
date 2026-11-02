import { redirect } from "next/navigation";
import { getSession } from "@/lib/cms/auth";
import PasswordForm from "../../../_components/password-form";
import ProfileEditor from "../../../_components/profile-editor";

export const dynamic = "force-dynamic";

export default async function Account() {
    const s = await getSession();
    if (!s) redirect("/admin/login");
    return (
        <div className="max-w-3xl">
            <h1 className="font-baloo text-3xl font-bold">A minha conta</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">A sua fotografia, os seus contactos e a palavra-passe do portal.</p>
            <div className="space-y-6">
                <ProfileEditor user={{ username: s.user, name: s.name, role: s.role, avatar: s.avatar, email: s.email, phone: s.phone }} />
                <div className="max-w-md"><h2 className="mb-3 font-baloo text-lg font-bold">Palavra-passe</h2><PasswordForm /></div>
            </div>
        </div>
    );
}
