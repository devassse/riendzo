import type { Condition } from "@/lib/weather";

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

function Sun({ cx = 32, cy = 32, r = 12 }: { cx?: number; cy?: number; r?: number }) {
    return (
        <g>
            <circle cx={cx} cy={cy} r={r} fill="currentColor" />
            {RAYS.map((a) => (
                <line
                    key={a} x1={cx} y1={cy - r - 6} x2={cx} y2={cy - r - 11}
                    transform={`rotate(${a} ${cx} ${cy})`} stroke="currentColor" strokeWidth={4} strokeLinecap="round"
                />
            ))}
        </g>
    );
}

const CLOUD = "M22 50a9 9 0 0 1-.6-18 12 12 0 0 1 23-2.5A10 10 0 0 1 46 50Z";

function Cloud({ x = 0, y = 0, scale = 1, outline = false }: { x?: number; y?: number; scale?: number; outline?: boolean }) {
    return (
        <path
            d={CLOUD} fill="currentColor" transform={`translate(${x} ${y}) scale(${scale})`}
            {...(outline ? { stroke: "var(--wx-bg, #2b8fb4)", strokeWidth: 3, paintOrder: "stroke" } : {})}
        />
    );
}

const Drops = ({ n = 3 }: { n?: number }) => (
    <g stroke="currentColor" strokeWidth={4} strokeLinecap="round">
        {Array.from({ length: n }, (_, i) => (
            <line key={i} x1={24 + i * 10} y1={54} x2={21 + i * 10} y2={61} />
        ))}
    </g>
);

/** Simple white weather glyphs (use `currentColor`). */
export default function WeatherIcon({ condition, isDay = true, size = 64, className }: { condition: Condition; isDay?: boolean; size?: number; className?: string }) {
    let art: React.ReactNode;
    switch (condition) {
        case "clear":
            art = isDay ? <Sun /> : <path d="M40 10a22 22 0 1 0 14 38A18 18 0 0 1 40 10Z" fill="currentColor" />;
            break;
        case "fair":
        case "partly-cloudy":
            art = (
                <>
                    {isDay ? <Sun cx={28} cy={28} r={11} /> : <path d="M30 8a18 18 0 1 0 12 31A15 15 0 0 1 30 8Z" fill="currentColor" />}
                    <Cloud x={14} y={4} scale={0.8} outline />
                </>
            );
            break;
        case "cloudy":
            art = <Cloud y={-3} scale={1.1} />;
            break;
        case "fog":
            art = (
                <g stroke="currentColor" strokeWidth={5} strokeLinecap="round">
                    <line x1={12} y1={22} x2={52} y2={22} /><line x1={8} y1={34} x2={48} y2={34} /><line x1={14} y1={46} x2={54} y2={46} />
                </g>
            );
            break;
        case "drizzle":
            art = <><Cloud y={-8} /><Drops n={2} /></>;
            break;
        case "rain":
        case "showers":
            art = <><Cloud y={-8} /><Drops n={3} /></>;
            break;
        case "thunderstorm":
            art = (
                <>
                    <Cloud y={-8} />
                    <path d="M34 40 26 54h7l-3 9 11-15h-7l3-8Z" fill="#ffd23f" />
                </>
            );
            break;
    }
    return (
        <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true" focusable="false">
            {art}
        </svg>
    );
}
