"use client";

import { useEffect } from "react";

/** Registers the offline-fallback service worker (production only, so `npm run dev` is never cached). */
export default function PwaRegister() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
        navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => { /* not installable here (e.g. http): the site still works */ });
    }, []);
    return null;
}
