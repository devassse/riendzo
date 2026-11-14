import ArtistProfile from "@/app/components/music/artist-profile";
import type { Artist } from "@/lib/cms/artist-types";
import { getItem } from "@/lib/cms/store";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const a = (await getItem("music-artists", (await params).slug)) as Artist | undefined;
    return { title: a ? `${a.name} · Artistas · Riendzo` : "Riendzo" };
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
    return <ArtistProfile slug={(await params).slug} />;
}
