/** Artist photo, or the initials on a coloured disc when there is no photo yet. */
export default function Avatar({ name, photo, color, className = "h-full w-full", text = "text-3xl" }: { name: string; photo?: string; color: string; className?: string; text?: string }) {
    const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
    return photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} loading="lazy" className={`${className} object-cover`} />
    ) : (
        <span className={`${className} flex items-center justify-center font-baloo font-bold ${text}`} style={{ background: `linear-gradient(135deg, ${color}, ${color}88)`, color: "#fff" }} aria-label={name} role="img">
            {initials}
        </span>
    );
}
