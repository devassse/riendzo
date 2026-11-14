import Image from "next/image";

/**
 * "Em breve" badges for the mobile apps (official App Store / Google Play artwork in /public/brand).
 * Not links yet: when the apps are published, wrap each <span> in <a href="store link" target="_blank" rel="noopener noreferrer">
 * and remove <SoonTag />.
 */
const BADGES = [
    { src: "/brand/app-store-badge.webp", label: "App Store", w: 1250, h: 368 },
    { src: "/brand/google-play-badge.webp", label: "Google Play", w: 1250, h: 369 },
];

export default function AppBadges({ className = "" }: { className?: string }) {
    return (
        <ul className={`flex flex-wrap gap-4 ${className}`} aria-label="Apps móveis, em breve">
            {BADGES.map((b) => (
                <li key={b.label}>
                    <span className="relative block select-none" role="img" aria-label={`${b.label}: em breve`}>
                        <Image src={b.src} alt="" width={b.w} height={b.h} sizes="150px" className="h-auto w-[150px] cursor-default" draggable={false} />
                        <SoonTag />
                    </span>
                </li>
            ))}
        </ul>
    );
}

const SoonTag = () => (
    <span className="absolute -right-2 -top-2 rounded-full bg-[#ffc14d] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5a3b00] shadow">Em breve</span>
);
