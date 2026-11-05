"use client";

import { useState } from "react";
import type { GeoPoint } from "./catalog-types";
import DirectionsDialog from "./directions-dialog";

/** "Como chegar": opens the route pop-up inside the app (nobody is sent away). */
export default function DirectionsButton({ location, name, address, className, style, children }: {
    location: GeoPoint; name: string; address?: string; className?: string; style?: React.CSSProperties; children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={`cursor-pointer ${className ?? ""}`} style={style} aria-haspopup="dialog">{children}</button>
            <DirectionsDialog location={open ? { name, lat: location.lat, lng: location.lng, address } : null} onClose={() => setOpen(false)} />
        </>
    );
}
