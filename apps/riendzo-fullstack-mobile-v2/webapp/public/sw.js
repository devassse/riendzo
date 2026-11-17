/*
 * Riendzo service worker: ONLY an offline fallback.
 * It never stores pages, accounts or orders: when the network is down the person sees /offline.html
 * instead of the browser error. Everything else always goes to the network.
 */
const CACHE = "riendzo-offline-v1";
const FILES = ["/offline.html", "/brand/riendzo-logo-vertical.png"];

self.addEventListener("install", (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (e) => {
    const r = e.request;
    const url = new URL(r.url);
    if (r.mode === "navigate") {
        e.respondWith(fetch(r).catch(() => caches.match("/offline.html")));
    } else if (url.origin === self.location.origin && FILES.includes(url.pathname)) {
        // the logo shown by the offline page itself
        e.respondWith(caches.match(url.pathname).then((hit) => hit || fetch(r)));
    }
    // everything else (images, scripts, API calls): untouched, straight to the network
});
