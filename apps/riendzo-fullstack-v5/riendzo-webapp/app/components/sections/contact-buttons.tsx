import type { CatalogContact, GeoPoint } from "./catalog-types";
import { directionsUrl } from "@/lib/cms/geo";
import DirectionsButton from "./directions-button";

const Icon = ({ d }: { d: string }) => (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

export type ContactLabels = {
    whatsapp: string; call: string; sendEmail: string; website: string; openMap: string; directions: string;
};

const btn = "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90";

/** WhatsApp, phone, e-mail, website, directions. Only the ones that were filled in are shown. */
export default function ContactButtons({
    contact, location, name, labels, color = "#0054b5",
}: { contact?: CatalogContact; location?: GeoPoint; name: string; labels: ContactLabels; color?: string }) {
    if (!contact && !location) return null;
    const wa = contact?.whatsapp
        ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(`Olá! Vi o perfil de ${name} na Riendzo e gostaria de mais informações.`)}`
        : null;

    return (
        <div className="flex flex-wrap gap-2">
            {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className={`${btn} text-white`} style={{ backgroundColor: "#1faa59" }}>
                    <Icon d="M20 12a8 8 0 01-11.8 7L4 20l1.1-4A8 8 0 1120 12zM9 9c0 3 3 6 6 6l1-1.5-2-1-1 .8c-.8-.4-1.600-1.200-2-2l.8-1-1-2z" /> {labels.whatsapp}
                </a>
            )}
            {contact?.phone && (
                <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className={`${btn} text-white`} style={{ backgroundColor: color }}>
                    <Icon d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z" /> {labels.call}
                </a>
            )}
            {location && (
                <DirectionsButton location={location} name={name} address={contact?.address} className={`${btn} border border-[#0b1220]/20 text-[#0b1220] hover:bg-[#0b1220]/5`}>
                    <Icon d="M3 11l18-8-8 18-2-8z" /> {labels.directions}
                </DirectionsButton>
            )}
            {/* straight to Google Maps with the route already marked */}
            {location && (
                <a href={directionsUrl(location)} target="_blank" rel="noopener noreferrer" className={`${btn} border border-[#0b1220]/20 text-[#0b1220] hover:bg-[#0b1220]/5`}>
                    <Icon d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 12a2 2 0 100-4 2 2 0 000 4z" /> {labels.openMap}
                </a>
            )}
            {contact?.email && (
                <a href={`mailto:${contact.email}`} className={`${btn} border border-[#0b1220]/20 text-[#0b1220] hover:bg-[#0b1220]/5`}>
                    <Icon d="M4 6h16v12H4zM4 7l8 6 8-6" /> {labels.sendEmail}
                </a>
            )}
            {contact?.website && (
                <a href={contact.website} target="_blank" rel="noopener noreferrer" className={`${btn} border border-[#0b1220]/20 text-[#0b1220] hover:bg-[#0b1220]/5`}>
                    <Icon d="M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /> {labels.website}
                </a>
            )}
        </div>
    );
}
