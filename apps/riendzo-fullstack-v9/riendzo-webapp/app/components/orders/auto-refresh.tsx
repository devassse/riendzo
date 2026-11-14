"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Reloads the server data every few seconds (only while the tab is visible): live order progress. */
export default function AutoRefresh({ seconds = 10 }: { seconds?: number }) {
    const router = useRouter();
    useEffect(() => {
        const id = setInterval(() => { if (document.visibilityState === "visible") router.refresh(); }, seconds * 1000);
        return () => clearInterval(id);
    }, [router, seconds]);
    return null;
}
