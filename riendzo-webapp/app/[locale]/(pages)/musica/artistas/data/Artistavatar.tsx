'use client';

import { useState } from 'react';

function initials(name: string) {
    return name
        .replace(/\(.*?\)/g, '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('');
}

export default function ArtistAvatar({
    name,
    src,
    className = 'h-14 w-14',
}: {
    name: string;
    src: string;
    className?: string;
}) {
    const [failed, setFailed] = useState(false);

    return (
        <span
            className={`flex flex-none items-center justify-center overflow-hidden rounded-full border border-[#c99a3d]/50 bg-[#1c1712] font-baloo font-bold text-[#c99a3d] ${className}`}
        >
            {failed ? (
                <span>{initials(name)}</span>
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={src}
                    alt={name}
                    loading="lazy"
                    onError={() => setFailed(true)}
                    className="h-full w-full object-cover"
                />
            )}
        </span>
    );
}