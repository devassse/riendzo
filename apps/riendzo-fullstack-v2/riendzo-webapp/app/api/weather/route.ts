import { NextResponse } from "next/server";
import { getWeather } from "@/lib/weather";

/** Current weather in Maputo for the hero card and the top bar. */
export async function GET() {
    const data = await getWeather();
    if (!data) return NextResponse.json({ error: "weather unavailable" }, { status: 502 });
    return NextResponse.json(
        { data },
        { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" } }
    );
}
